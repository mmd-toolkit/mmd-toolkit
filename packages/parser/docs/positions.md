# Positions of the tree

Japanese version: [positions.ja.md](./positions.ja.md)

This document defines the positions in the tree that `@mmd-toolkit/parser`
produces: the `range` and `loc` of nodes, tokens, comments, directives, and the
frontmatter, the ranges of nodes, and the invariants. The shape of the tree, its
node types, fields, and values, is defined by the specification in
[`ast.md`](../../spec/docs/ast.md); the tokens and the lists of the root are
defined in [tokens.md](./tokens.md).

## Design goals

- **Positioned.** Every node, token, comment, directive, and frontmatter carries
  `range` and `loc`, following the ESTree convention.
- **Lossless.** The tree loses nothing of the input. Every character of the
  input is in a token or a comment, or it is whitespace, as defined in
  [Notation](../../spec/docs/common.md#notation), or a line terminator (see
  [Invariants](#invariants)). With the source text and the ranges, the input is
  reproduced exactly.

## Field types

- **offset pair** is two integers, a start offset and an end offset, as
  described under [Positions](#positions).
- **position** and **location** are the records described under
  [Positions](#positions).

## Positions

- Offsets count UTF-16 code units, as ESTree and Prettier do. The source text
  between the two offsets of a `range` is the text of the node, token, comment,
  directive, or frontmatter that has it. [fixture:
  sequence/lex-text-after-non-bmp-character]
- A `range` is an offset pair: a 0-based start offset and an end offset that is
  not included. [fixture: common/crlf]
- A `loc` is a location: a `start` and an `end` position. Each position has a
  `line`, counted from 1, and a `column`, counted from 0 in UTF-16 code units.
  [fixture: common/crlf] [fixture: sequence/lex-text-after-non-bmp-character]
- `\r\n`, a lone `\r`, and `\n` each end a line, because these are the sequences
  mermaid.js normalizes to `\n` (see
  [Line terminators](../../spec/docs/common.md#line-terminators)). U+2028 and
  U+2029 do not end a line. [fixture: common/crlf] [fixture:
  common/directive-spans-lone-cr] [fixture: common/comment-after-u2028]
  [fixture: common/comment-after-u2029]

| Record   | Field    | Type     | Meaning                                      |
| -------- | -------- | -------- | -------------------------------------------- |
| position | `line`   | integer  | Line number, counted from 1.                 |
| position | `column` | integer  | Column, counted from 0 in UTF-16 code units. |
| location | `start`  | position | Position of the first character.             |
| location | `end`    | position | Position just after the last character.      |

The specification uses two units on purpose. The rules of
[common.md](../../spec/docs/common.md) speak of characters, and a character is a
Unicode code point (see [Notation](../../spec/docs/common.md#notation)).
Positions count UTF-16 code units. A character outside the Basic Multilingual
Plane is one character but two code units, so it advances `range` offsets and
`column` by 2. [fixture: sequence/lex-text-after-non-bmp-character]

## Node ranges

Every node has these fields besides those of
[`ast.md`](../../spec/docs/ast.md#nodes):

| Field   | Type        | Meaning                              |
| ------- | ----------- | ------------------------------------ |
| `range` | offset pair | Where the node is in the source.     |
| `loc`   | location    | The same place as lines and columns. |

A node's range normally runs from the start of its first token to the end of its
last token; a node type may explicitly require an extension to source EOF.
`Root.range` always covers the whole input. A node's tokens are the tokens of
the construct it stands for, never a `Directive` token or a token of the
frontmatter, although a `Directive` token may lie inside the range of a node,
between two of its tokens; each node type says which they are where that is not
plain, and a token between two nodes, such as a separator, may belong to
neither. [fixture: flowchart/tokens-label-string-directive-then-text] [fixture:
flowchart/tokens-diagram-trailing-separator] An `IgnoredSemicolon` token, which
no grammar reads, is likewise the token of no node, and may lie inside the range
of a node, between two of its tokens. [fixture:
common/entity-css-in-string-label] So the tokens of the node in `Root.body` are
all the tokens of the diagram text other than the `Directive` and the
`IgnoredSemicolon` tokens, from the first to the last: its range also covers the
tokens that belong to no statement, such as a separator after the last
statement, but normally not a directive or an ignored `;` after the last of its
tokens; an EOF-ending child may extend the diagram range past them. The range of
the flowchart diagram of `A;` ends after the `;`, a separator, while that of a
class diagram whose last line is `classDef c fill:#f00;` ends before the `;`,
which the line rule ignores. [fixture:
flowchart/tokens-diagram-trailing-separator] [fixture:
class/tokens-class-def-ignored-semicolon] [fixture:
flowchart/gram-separator-before-directive] The range of a node covers the ranges
of all its child nodes, as tools that walk an ESTree tree, such as those that
find the node at a position or that attach comments, expect; where the tokens of
a construct alone would not give that, the node type says how its range is
extended. An unclosed AgentflowAccDescrBlockStatement and its containing diagram
reach source EOF, including trailing whitespace and directives, without adding
tokens for skipped trivia. [fixture: agentflow/db-accessibility-unclosed-block]
[fixture: agentflow/db-accessibility-empty-unclosed]

`Root.range` is `[0, input.length]`. [fixture: common/crlf]

## Invariants

Every tree satisfies these conditions:

- Every character of the input is in a token or a comment, or it is whitespace
  or a line terminator. Whitespace is the set defined in
  [Notation](../../spec/docs/common.md#notation), which includes U+00A0, U+FEFF,
  U+2028, and U+2029. [fixture: common/whitespace-characters] [fixture:
  common/nbsp-as-space] [fixture: common/bom-mid-text] [fixture:
  common/comment-after-u2028] [fixture: common/comment-after-u2029]
- The text of every token, comment, directive, and frontmatter equals the source
  text of its range; for a token, that text is `value`. [fixture:
  common/directive-spans-lone-cr]
- `Root.tokens` is in source order, and its tokens do not overlap. [fixture:
  flowchart/tokens-label-string-directive-then-text]
- A token starts or ends with whitespace or a line terminator only where it is
  at the start or the end of the text that mermaid.js reads as a value, next to
  a directive, a comment region, or an ignored `;` that cuts that text, or at
  the start of a token that goes on with a value that a token before it starts,
  as the text after the string that a flowchart label starts with (see
  [Tokens](./tokens.md#tokens) and
  [the flowchart tokens](./tokens/flowchart.md#tokens)). [fixture:
  class/db-generic-spaces] [fixture:
  flowchart/tokens-directive-label-space-after] [fixture:
  common/comment-in-string] [fixture:
  class/tokens-style-ignored-semicolon-after-space] [fixture:
  flowchart/gram-label-string-then-text] A token of whitespace only may also end
  with it where a token of the value that it belongs to follows it directly, as
  the whitespace between the colour candidate and the remainder of a sequence
  box text (see [the sequence tokens](./tokens/sequence.md#tokens)). [fixture:
  sequence/tokens-box-text-space-between-parts] [fixture:
  sequence/db-box-colour-then-spaces-and-line-separator]
- A comment lies outside all tokens. [fixture: common/comment-in-string]
- A directive lies inside no other token. It may lie inside a comment: after its
  mark, or between the two `%` of a `%%` mark. Every directive that lies outside
  all tokens and comments has exactly one `Directive` token, with the
  directive's range, and every `Directive` token is such a directive's.
  [fixture: common/directive-in-comment] [fixture:
  common/comment-percent-joined-by-directive] [fixture:
  common/comment-after-directive]
- Every `;` that the line rule ignores and that lies outside all comments has
  exactly one `IgnoredSemicolon` token, with the range of the `;`, and every
  `IgnoredSemicolon` token is such a `;`. [fixture:
  common/entity-css-in-string-label] [fixture:
  sequence/tokens-comment-then-ignored-semicolon] [fixture:
  state/tokens-ignored-semicolon-in-comment-before-comment-line]
- No two comments overlap, and no two directives overlap. [fixture:
  common/comment-after-directive] [fixture:
  flowchart/tokens-string-two-comment-lines] [fixture:
  flowchart/tokens-directives-label-space-between]
- When there is frontmatter, the first tokens are the tokens in its range: the
  opening `---`, the body when it is not all whitespace, and the closing `---`
  (see [Frontmatter](../../spec/docs/ast.md#frontmatter)). They come before all
  comments and directives. [fixture: common/config-directive-after-frontmatter]
  [fixture: common/frontmatter-empty-body]
- Except for node types that explicitly extend to source EOF and their
  containing nodes, the range of a node runs from the start of its first token
  to the end of its last token; `Root.range` covers the whole input. Apart from
  `Root`, every node defined in this document has at least one token: an
  `ErrorDiagram` has the tokens that hold the characters of `error`, one or more
  (see
  [Tokens of the error pseudo-diagram](./tokens.md#tokens-of-the-error-pseudo-diagram)),
  and a [FlowchartLabel](../../spec/docs/ast/flowchart.md#flowchartlabel) that
  is all whitespace the token of that whitespace (see
  [the flowchart tokens](./tokens/flowchart.md#tokens)). [fixture:
  common/error-split-by-directive] [fixture: flowchart/gram-label-space]
- The range of a node covers the ranges of its child nodes. The child nodes of a
  node do not overlap, and they are in source order when taken in the order of
  the child fields, each list in its own order, except at the nodes whose
  documents say otherwise (see [Nodes](../../spec/docs/ast.md#nodes)). [fixture:
  flowchart/gram-data-consecutive-blocks] [fixture:
  flowchart/gram-pipe-label-space-after] [fixture:
  flowchart/db-arrow-dash-head-length]
- The `raw` of a node that has it, a StringLiteral or a NumericLiteral, equals
  the source text of its range. [fixture: flowchart/gram-label-space-string]
  [fixture: state/gram-scale]
- No token, comment, or directive has an empty range: a value that mermaid.js
  reads as empty has no token, an empty fragment is no token and no comment, and
  a comment and a directive hold at least their marks. The one value read as
  empty that has a token is a field of spaces only of a sankey diagram, which
  makes a node: it has the token of its spaces (see
  [the sankey tokens](./tokens/sankey.md#tokens)). [fixture:
  flowchart/gram-acc-title-empty-at-end] [fixture:
  flowchart/tokens-rawtext-comment-line-then-closing-bracket] [fixture:
  class/lex-bare-percent-line-between-statements] [fixture:
  common/directive-empty-argument] [fixture: sankey/db-spaces-only-target-id]

The second condition is about the source text: `Token.value` and the text of
every comment, directive, and frontmatter equal the input in their ranges. The
values of nodes, which leave out comment regions, directives, and the `;` that
the line rule ignores, are not part of it.
