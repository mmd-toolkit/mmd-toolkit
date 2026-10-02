# Abstract syntax tree

Japanese version: [ast.ja.md](./ast.ja.md)

This document defines the abstract syntax tree of Mermaid text. An
implementation of this specification produces trees that use the node names,
field names, and token kinds defined here. A change to the tree is made here
first, and implementations follow it.

## Design goals

- **Structure and values.** The tree follows ESTree. A node carries the
  structure and the values of what it stands for, and holds its child nodes in
  named fields, such as `Root.body`. No node has a generic list of children.
  Punctuation and keywords are not nodes; they appear only as tokens.
- **Lists of tokens and comments.** As in ESLint, the root holds every token in
  source order in `tokens` and every comment in `comments`. Every character that
  is not whitespace or a line terminator is in a token or a comment, as tools
  built for ESLint expect. A directive is a token too, of the kind `Directive`,
  and so are the delimiters and the body of the frontmatter; the root also lists
  directives and the frontmatter as records with fields of their own, in
  `directives` and `frontmatter`. Comments are not tokens.
- **Positioned.** Every node, token, comment, directive, and frontmatter carries
  `range` and `loc`, following the ESTree convention.
- **Lossless.** The tree loses nothing of the input. Every character of the
  input is in a token or a comment, or it is whitespace, as defined in
  [Notation](./common.md#notation), or a line terminator (see
  [Invariants](#invariants)). With the source text and the ranges, the input is
  reproduced exactly.
- **Diagram-agnostic root.** The root holds the parts shared by all diagrams.
  The body node type depends on the diagram type.
- **What a node is.** A node type names what the node stands for in the
  language, never how its text is lexed: there is no node type per token kind
  and no catch-all node. The role of a node is given by the field that holds it,
  such as `styles` or `arguments`, not by a node type of its own.
- **Structure as written.** The tree shows the structure that the author wrote,
  as the language means it: the same text can have different shapes where its
  positions mean different things, such as `A,B`, which is one name as the id of
  a vertex and a list of names after `class`. The tree does not copy the steps
  by which mermaid.js builds its Db, such as joining parts and splitting them
  again; those steps are written in the Db normalization of each diagram
  document.

## How fields are described

Each node type below has a table of its fields, with a name, a type, and a
meaning. The types are written in words:

- **integer**, **string**, and **boolean** have their usual meaning. A
  **number** may have a fraction.
- **offset pair** is two integers, a start offset and an end offset, as
  described under [Positions](#positions).
- **list of**, followed by a type, is a sequence of values of that type, in
  order.
- A type followed by **or null** is either a value of that type or the absence
  of a value.
- Parentheses group a type: **list of (Identifier or null)** is a list whose
  elements are each an Identifier or null.
- A node type name, such as **Comment**, is a node of that type. **Token** is a
  token as described under [Tokens](#tokens).
- **position** and **location** are the records described under
  [Positions](#positions).

Every field is set when the node is created and is never changed afterwards.

## Positions

- Offsets count UTF-16 code units, as ESTree and Prettier do. The source text
  between the two offsets of a `range` is the text of the node, token, comment,
  directive, or frontmatter that has it.
- A `range` is an offset pair: a 0-based start offset and an end offset that is
  not included.
- A `loc` is a location: a `start` and an `end` position. Each position has a
  `line`, counted from 1, and a `column`, counted from 0 in UTF-16 code units.
- `\r\n`, a lone `\r`, and `\n` each end a line, because these are the sequences
  mermaid.js normalizes to `\n` (see
  [Line terminators](./common.md#line-terminators)). U+2028 and U+2029 do not
  end a line.

| Record   | Field    | Type     | Meaning                                      |
| -------- | -------- | -------- | -------------------------------------------- |
| position | `line`   | integer  | Line number, counted from 1.                 |
| position | `column` | integer  | Column, counted from 0 in UTF-16 code units. |
| location | `start`  | position | Position of the first character.             |
| location | `end`    | position | Position just after the last character.      |

The specification uses two units on purpose. The rules of
[common.md](./common.md) speak of characters, and a character is a Unicode code
point (see [Notation](./common.md#notation)). Positions count UTF-16 code units.
A character outside the Basic Multilingual Plane is one character but two code
units, so it advances `range` offsets and `column` by 2.

## Nodes

Every node has these fields:

| Field   | Type        | Meaning                                    |
| ------- | ----------- | ------------------------------------------ |
| `type`  | string      | The name of the node type, such as `Root`. |
| `range` | offset pair | Where the node is in the source.           |
| `loc`   | location    | The same place as lines and columns.       |

Each node type adds its own fields, and a node's child nodes are the values of
some of those fields. Each node type states its **child fields**: the fields
whose values are child nodes, in the order in which a tool that walks the tree
visits them, as ESLint does with its visitor keys. A tool follows the child
fields only. Tokens are not nodes and are never visited. Each diagram document
that adds a node type states its child fields in the same way.

The child nodes do not overlap. A list in a child field is in source order, and
the child fields of a node are usually in source order too. They are not where
one field is written in a different place depending on the way of writing: the
fields keep one order, as ESLint's visitor keys of `TemplateLiteral` keep
`quasis` before `expressions` while the source alternates them. The diagram
document says so at each such node; a tool that needs the source order sorts the
child nodes by their ranges.

A node's range runs from the start of its first token to the end of its last
token; only `Root.range` covers the whole input. A node's tokens are the tokens
of the construct it stands for, never a `Directive` token or a token of the
frontmatter, although a `Directive` token may lie inside the range of a node,
between two of its tokens; each node type says which they are where that is not
plain, and a token between two nodes, such as a separator, may belong to
neither. A node without a token, which a diagram document allows only for a node
whose text is all whitespace, covers its units instead: its range runs from the
start of its first unit to the end of its last
([units](./common.md#a-directive-is-a-token-boundary) are defined by each
diagram document). The range of a node covers the ranges of all its child nodes,
as tools that walk an ESTree tree, such as those that find the node at a
position or that attach comments, expect; where the tokens of a construct alone
would not give that, the node type says how its range is extended.

The **text of a range** is the source text of the range without what lies in it
but is not written as part of a value: the directives, the comment regions, and
the `;` that the line rule ignores. Nothing else is left out, added, or
rewritten: line terminators, attribute quotes, and entities stay as the author
wrote them, not in [converted form](./common.md#reading-a-source), which is how
the lexer reads a text and how a diagram's Db normalization uses it. The value
of a leaf node is the text of its range, or the part of it that its node type
names; a [NumericLiteral](#numericliteral) holds the number that that text
writes, and an [Identifier](#identifier) the texts of its units. Where the value
is the text of the whole range, as for a diagram's literal, it neither starts
nor ends with whitespace, because a range runs from a token to a token, unless
the node has no token; the whitespace written around a node belongs to no node.
Where the value is the part inside delimiters that belong to the node's own
tokens, such as the content of a [StringLiteral](#stringliteral) or of the
string that a label starts with, or the text of a data block between `@{` and
`}`, it keeps the whitespace written inside those delimiters, at its ends too:
the label of `A[" x "]` has the value of a space, `x`, and a space, and the
first data block of `A@{`, a line break, `shape: rect`, a line break, and `}`
has the value of a line feed, `shape: rect`, and a line feed. [fixture:
flowchart/tokens-label-string-inner-whitespace] [fixture:
flowchart/gram-data-consecutive-blocks] The two literal nodes,
[StringLiteral](#stringliteral) and [NumericLiteral](#numericliteral), also have
the field `raw`, as ESTree's `Literal` does: it is the source text of the range
itself, with nothing left out, so it keeps what the text of the range leaves
out, such as the quotes of a string and a comment region inside it.

A child field whose value is a list may have null elements where its node type
says so, as in ESTree's array holes; a tool that walks the tree skips them.

## Tokens

A token is one lexical unit of the diagram, as the diagram's lexer reads it, or
a directive or a part of the frontmatter (see
[Comments, directives, and frontmatter](#comments-directives-and-frontmatter)).
The tokens are listed in `Root.tokens`; they are not nodes and are not the
values of node fields.

| Field   | Type        | Meaning                                        |
| ------- | ----------- | ---------------------------------------------- |
| `type`  | string      | The token kind, one of the kinds listed below. |
| `value` | string      | The source text of `range`, as written.        |
| `range` | offset pair | Where the token is in the source.              |
| `loc`   | location    | The same place as lines and columns.           |

`value` is the source text of the token's range, as ESLint's tokens have it. The
conversions of [common.md](./common.md) do not apply to it: reading a line
terminator as `\n`, an attribute quote as `'`, or an entity as its placeholder;
nor does it skip a comment region or a `;` that the line rule ignores inside the
token. The values of nodes skip those, but are not converted either (see
[Nodes](#nodes)).

The token kinds are these, and only these. Each diagram document says which
kinds its tokens have; a kind is added here when a diagram needs it.

| Kind         | Used by                                                                                                                                                                                                            | Meaning                                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | [flowchart](./ast/flowchart.md#tokens), [sequence](./ast/sequence.md#tokens), [class](./ast/class.md#tokens)                                                                                                       | A word with a fixed meaning at its position.                                                                                                                                           |
| `Identifier` | [flowchart](./ast/flowchart.md#tokens), [sequence](./ast/sequence.md#tokens), [class](./ast/class.md#tokens)                                                                                                       | A name that the author chooses.                                                                                                                                                        |
| `Numeric`    | [flowchart](./ast/flowchart.md#tokens), [sequence](./ast/sequence.md#tokens)                                                                                                                                       | A number.                                                                                                                                                                              |
| `String`     | [flowchart](./ast/flowchart.md#tokens), [class](./ast/class.md#tokens)                                                                                                                                             | A quoted string, with its quotes.                                                                                                                                                      |
| `RawText`    | every diagram (the frontmatter body), the `error` pseudo-diagram (see [ErrorDiagram](#errordiagram)), [flowchart](./ast/flowchart.md#tokens), [sequence](./ast/sequence.md#tokens), [class](./ast/class.md#tokens) | Characters that the parser takes as one content without reading any structure in them, not enclosed in quotes (enclosed, they are a `String`), such as the text of a label or a style. |
| `Punctuator` | every diagram (the frontmatter delimiters), [flowchart](./ast/flowchart.md#tokens), [sequence](./ast/sequence.md#tokens), [class](./ast/class.md#tokens)                                                           | A delimiter, separator, or operator, such as `[` or `-->`.                                                                                                                             |
| `Directive`  | every diagram                                                                                                                                                                                                      | A directive (see [Directive](#directive)).                                                                                                                                             |

Which characters form a token, and of which kind, is defined by each diagram
document, except for the `Directive` tokens and the tokens of the frontmatter,
which are the same in every diagram.

Whitespace and line terminators are never tokens on their own, in any diagram.
Where the diagram's grammar gives a line terminator meaning, for example as the
end of a statement, the lexer reads it, but no token or node is made for it;
what it separates shows in the structure of the tree, such as the list of
statements. Where whitespace or line terminators lie inside the range of a
token, as in the text of a label or a multi-line quoted string, they are part of
that token. How the lexer reads a line terminator is a rule of
[Line terminators](./common.md#line-terminators), not a matter of tokens.

The lexer reads through a `;` that the
[`style` and `classDef` line rule](./common.md#style-and-classdef-lines) ignores
as if it were not there, so the tokens around it are found as if it were absent.
The `;` itself then lies inside a token when characters of that token lie on
both sides of it. Otherwise it is a token of its own, of the kind that the
diagram gives a `;` that stands alone at that position. This rule is the same
for every diagram. No token kind and no field of a node tells whether a `;` was
ignored, and an ignored `;` affects no value of any node. So the list of tokens
does not tell an ignored `;` that is a token of its own from a `;` that the
grammar reads: in flowchart, `style A fill:#f00;` and `style A fill:red;` both
end in a `Punctuator` token `;`, which the line rule ignores in the first and
which is the separator of the statement in the second. Which `;` are ignored is
found by applying the line rule to the source. [fixture:
flowchart/tokens-style-semicolon-ignored] [fixture:
flowchart/tokens-style-semicolon-separator] The grammar does not read an ignored
`;`, so it never makes a node: in flowchart, only a `;` that the grammar reads
as a line of its own makes an empty statement. In the `error` pseudo-diagram,
for example, `style:#f;` at the end of a line is the `RawText` token `style:#f`
followed by the `RawText` token `;`, while `style:#f;x` is one `RawText` token
(see [ErrorDiagram](#errordiagram)). [fixture:
common/error-style-semicolon-trailing] [fixture:
common/error-style-semicolon-inside]

## Comments, directives, and frontmatter

These are not nodes. The root lists them as records in `comments`, `directives`,
and `frontmatter`; no node holds them, and a tool that walks the tree does not
visit them. Each record has a `type`, a `range`, and a `loc`. Its text is the
source text of its range; the fields below hold its content. A comment is not a
token. A directive that lies outside every token and every comment is also a
token in `Root.tokens`, of the kind `Directive`, with the same range as the
record. The frontmatter is two or three tokens, which divide its range (see
[Frontmatter](#frontmatter)). A directive's record and its token have the same
name, as `Identifier` names both a node and a token kind (see
[Shared leaf nodes](#shared-leaf-nodes)), and they hold different things under
`value`: the record its content, as described below, and the token the source
text of its range, as every token does.

### Comment

`type` is `Comment`.

| Field   | Type   | Meaning                                                                                                                            |
| ------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `value` | string | The source text of the comment after its mark: the `%%` of a comment line, after the second `%`, or the mark of a diagram comment. |

A comment line produces a `Comment`, and so does a **diagram comment**: text
that a diagram's own lexer reads as a comment, which its document defines, such
as a `#` or a `%%` in the middle of a line in
[sequence](./diagrams/sequence.md#the-statement-context). The range starts at
the mark, the first `%` of the `%%` of a comment line or the mark of a diagram
comment, and ends before the line terminator; a comment starts at its mark, and
no character before the mark is part of it. The whitespace-only lines and the
line terminator that the comment region also covers are whitespace and line
terminators. A diagram comment is found, as tokens are, as if a `;` that the
line rule ignores were not there (see [Tokens](#tokens)): such a `;` lies inside
the comment when characters of the comment lie on both sides of it, and
otherwise it is a token of its own. At the end of `A->>B: x #style:#x;` in
sequence, the comment is `#style:#x`, and the `;` after it is a token. In every
diagram but agentflow, a comment line never holds such a `;`, because the line
rule leaves comment regions out of its line segments (see
[`style` and `classDef` lines](./common.md#style-and-classdef-lines)). [fixture:
sequence/tokens-comment-then-ignored-semicolon] A diagram whose Db sets
[`preserveCommentsWhenParsing`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/Diagram.ts#L66-L76)
(agentflow in the pinned mermaid.js) sees comment lines in its parser input; its
document says how the tree represents them. A `%%` that is not a comment line,
such as a trailing `%%` after a statement or a line containing only `%%`, is
[diagram text](./common.md#reading-a-source) and is part of a token.

A comment usually lies outside all tokens. When a comment region lies inside a
single token, for example a `%%` comment line inside a multi-line quoted label,
the lexer reads through the region, so the token continues after it: the
comment's range lies inside the token's range, and the token's `value` contains
it as written. [fixture: common/comment-in-string]

### Directive

`type` is `Directive`.

| Field    | Type    | Meaning                                                                         |
| -------- | ------- | ------------------------------------------------------------------------------- |
| `name`   | string  | The directive name, for example `init` in `%%{init: {...}}%%`.                  |
| `value`  | string  | The text between `%%{` and `}%%`, or to the end of the directive when unclosed. |
| `closed` | boolean | Whether the directive ends with `}%%`.                                          |

The range is one match of the directive scan, which runs over the source text
after the frontmatter (see [common.md](./common.md#where-a-directive-is)),
without the whitespace at its end. An unclosed directive therefore runs to the
end of the text, or ends after a word argument; the whitespace that the scan
takes after the argument is removed with the directive, as the whitespace-only
lines of a comment region are with a comment, and in the tree it is whitespace,
outside the directive. `name` is the directive's name as defined there. The tree
does not parse the argument. `value` holds what is written between the
delimiters, the name included, as the `value` of a comment and of the
frontmatter does.

A directive is a token boundary (see
[common.md](./common.md#a-directive-is-a-token-boundary)), so it lies inside no
other token, except as part of a comment region that lies inside a token: the
lexer reads through such a region, directives included. Such a directive, and a
directive inside a comment, has no `Directive` token: its characters are in that
token or that comment. [fixture: common/comment-region-directive-in-string]
[fixture: common/comment-directive-in-string] A directive after the `%%` of a
comment line lies inside the comment's range, and mermaid.js still reads it for
configuration (see
[The configuration scan](./common.md#the-configuration-scan)). [fixture:
common/directive-in-comment] A directive before the comment's `%%`, as in
`%%{init: {}}%% %% note`, lies outside the comment, which starts at its `%%`.
[fixture: common/comment-after-directive] In `%%%{init: {}}%%% c`, the comment's
`%%` is the first and the last `%`, so the directive between them lies inside
the comment's range, and the comment's `value` is a space and `c`. [fixture:
common/comment-percent-joined-by-directive] The same holds for a diagram comment
whose mark is `%%`: its mark is found in the text without directives, a
directive may lie between its two `%`, and its `value` is the source text after
the mark, directives included (see
[sequence](./diagrams/sequence.md#units-and-contexts)). [fixture:
sequence/lex-diagram-comment-directive-between-marks] [fixture:
sequence/lex-diagram-comment-directive-after-single-mark]

`Root.directives` plays no part in configuration: this specification does not
parse directive arguments, and mermaid.js finds the directives that configure
the diagram with a scan of its own, which differs from them in rare cases (see
[The configuration scan](./common.md#the-configuration-scan)).

### Frontmatter

`type` is `Frontmatter`.

| Field        | Type        | Meaning                                                              |
| ------------ | ----------- | -------------------------------------------------------------------- |
| `value`      | string      | The YAML text between the delimiter lines, as written in the source. |
| `valueRange` | offset pair | Where `value` is in the source.                                      |

The range runs from the `---` of the opening delimiter line through the closing
`---`. The indent before the opening `---`, and the whitespace and blank lines
after the closing delimiter, which the frontmatter rule also covers, are
whitespace and line terminators. `value` is the body as defined in
[common.md](./common.md#frontmatter); it is not dedented, and the tree does not
parse the YAML.

The frontmatter's range holds these tokens, in this order: the opening `---`, a
`Punctuator` token; the body, a `RawText` token from the first character of the
body that is not whitespace to the last one, when the body is not all
whitespace; and the closing `---`, a `Punctuator` token. Everything else in the
range is whitespace and line terminators: the whitespace after each `---` on its
line, the whitespace-only lines before the body, and the whitespace at the start
and the end of the body, the indent of its first line included. The indent of
the other lines of the body lies inside the body's token, and `value` keeps the
body with all its indents. A delimiter line holds nothing but its indent, `---`,
and line whitespace, so no other token lies on it; U+2028 after a `---` is line
whitespace. [fixture: common/frontmatter-indented] [fixture:
flowchart/frontmatter-title-crlf] [fixture:
common/frontmatter-bom-both-delimiters] [fixture:
common/frontmatter-blank-line-then-delimiter-only] [fixture:
common/frontmatter-line-separator-after-opening] [fixture:
common/frontmatter-line-separator-end-of-body] [fixture:
common/frontmatter-line-separator-inside-body]

The delimiters and the body are separate tokens because they are separate lines:
the line breaks and the indents between them are layout, which a tool reads as
whitespace, as it does between the tokens of a diagram. A directive is one
token: it is one run of text, and its name and argument are held by its record.
Like every token, the tokens of the frontmatter belong to no node; the
`Punctuator` token `---` of the opening delimiter is not the `---` link of a
flowchart, which lies in the diagram's range.

## Invariants

Every tree satisfies these conditions:

- Every character of the input is in a token or a comment, or it is whitespace
  or a line terminator. Whitespace is the set defined in
  [Notation](./common.md#notation), which includes U+00A0, U+FEFF, U+2028, and
  U+2029.
- The text of every token, comment, directive, and frontmatter equals the source
  text of its range; for a token, that text is `value`.
- `Root.tokens` is in source order, and its tokens do not overlap.
- No token starts or ends with whitespace or a line terminator.
- A comment lies outside all tokens, or entirely inside the range of one token.
- A directive lies inside no other token, except as part of a comment region
  that lies inside a token. It may lie inside a comment: after its mark, or
  between the two `%` of a `%%` mark. Every directive that lies outside all
  tokens and comments has exactly one `Directive` token, with the directive's
  range, and every `Directive` token is such a directive's.
- No two comments overlap, and no two directives overlap.
- When there is frontmatter, the first tokens are the tokens in its range: the
  opening `---`, the body when it is not all whitespace, and the closing `---`
  (see [Frontmatter](#frontmatter)). They come before all comments and
  directives.
- The range of a node runs from the start of its first token to the end of its
  last token, and `Root.range` covers the whole input. Apart from `Root`, every
  node defined in this document has at least one token: an `ErrorDiagram` has at
  least the token that holds `error`. The exception is a
  [FlowchartLabel](./ast/flowchart.md#flowchartlabel) that is all whitespace,
  whose range covers its units (see [Nodes](#nodes)).
- The range of a node covers the ranges of its child nodes. The child nodes of a
  node do not overlap, and they are in source order when taken in the order of
  the child fields, each list in its own order, except at the nodes whose
  documents say otherwise (see [Nodes](#nodes)).
- The `raw` of a node that has it, a StringLiteral or a NumericLiteral, equals
  the source text of its range.

The second condition is about the source text: `Token.value` and the text of
every comment, directive, and frontmatter equal the input in their ranges. The
values of nodes, which leave out comment regions, directives, and the `;` that
the line rule ignores, are not part of it.

## Root

`type` is `Root`.

| Field         | Type                | Meaning                                                                                      |
| ------------- | ------------------- | -------------------------------------------------------------------------------------------- |
| `diagramType` | DiagramType         | The diagram type id as mermaid.js reports it, such as `flowchart-v2`.                        |
| `body`        | DiagramBody         | The diagram body.                                                                            |
| `frontmatter` | Frontmatter or null | The frontmatter, if the source has one.                                                      |
| `comments`    | list of Comment     | Every comment, in source order.                                                              |
| `directives`  | list of Directive   | Every directive, in source order.                                                            |
| `tokens`      | list of Token       | Every token, `Directive` tokens and the tokens of the frontmatter included, in source order. |

`Root.range` is `[0, input.length]`. Its only child field is `body`;
`frontmatter`, `comments`, `directives`, and `tokens` are lists, not child
fields. Every character that is not whitespace or a line terminator is in
`tokens` or `comments`, so a tool that goes through tokens and comments
together, as ESLint's `SourceCode` does, finds no gap at a directive or at the
frontmatter.

`diagramType` is the id that
[`mermaid.parse()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L96-L117)
reports as `diagramType`, because fixtures record the same ids. The `graph` and
`flowchart` headers both give `flowchart-v2`; `flowchart-elk` gives
`flowchart-elk`; `swimlane-beta` gives `swimlane`.

**DiagramType** is one of these 38 strings, in the order in which mermaid.js
tries the detectors (see [detection.md](./detection.md)): `error`,
`flowchart-elk`, `mindmap`, `architecture`, `agentflow`, `c4`, `kanban`,
`classDiagram`, `er`, `gantt`, `info`, `pie`, `requirement`, `sequence`,
`swimlane`, `flowchart-v2`, `timeline`, `gitGraph`, `stateDiagram`, `journey`,
`quadrantChart`, `sankey`, `packet`, `xychart`, `block`, `eventmodeling`,
`treeView`, `radar`, `ishikawa`, `treemap`, `railroad`, `railroadEbnf`,
`railroadAbnf`, `railroadPeg`, `venn`, `wardley`, `cynefin`, and `usecase`. They
are the ids of the detectors registered by the pinned mermaid.js, including the
`error` pseudo-diagram and excluding `---`.

mermaid.js also registers a `---` pseudo-diagram, but its parser always throws,
so an input it selects is always rejected. No tree has it, and it is not a
DiagramType. This specification defines the set of DiagramType ids. The list
includes `flowchart-elk`, `mindmap`, and `architecture`, which mermaid.js
registers only when
[`includeLargeFeatures`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L85-L87)
is true; it is true in the default entry point of the npm package.

**DiagramBody** is an `ErrorDiagram` or one of the body node types defined in
the diagram sections below: a
[`FlowchartDiagram`](./ast/flowchart.md#flowchartdiagram) or a
[`SequenceDiagram`](./ast/sequence.md#sequencediagram).

## ErrorDiagram

`type` is `ErrorDiagram`. A node with no other fields and no child fields.

The body of the `error` pseudo-diagram (see
[common.md](./common.md#diagram-detection)); `diagramType` is `error`. Its
tokens, besides the `Directive` tokens and the tokens of the frontmatter, are
made from the maximal runs of characters that are not whitespace or line
terminators in the text without its directives and comment regions; each is a
`RawText` token. Whitespace or a line terminator ends a run, and a directive
between two characters of a run cuts it, as it cuts every token (see
[common.md](./common.md#a-directive-is-a-token-boundary)). A `;` that the line
rule ignores follows the rule of [Tokens](#tokens): it is part of a run's token
when characters of the run lie on both sides of it, and otherwise a `RawText`
token of its own, because the pseudo-diagram gives every character that is not
whitespace the kind `RawText`. The node's range runs from the start of its first
token to the end of its last. There is always at least one token, the one that
holds `error`.

The runs are made of the characters of the text, not of the
[diagram text](./common.md#reading-a-source): a `;` that the line rule ignores
is not diagram text, but it is in a token. A comment is always outside the
tokens, because a comment region starts at a comment start, which is the start
of the text or right after a line terminator, U+2028, or U+2029, and each of
those ends a run.

The detectors see the text only after the extra removals of detection, so the
tokens can be more than the word `error`:

- `%%`, a line break, and `error` give the tokens `%%` and `error`. [fixture:
  common/error-bare-percent-line]
- `error %% x` followed by a line break gives `error`, `%%`, and `x`. The `%% x`
  is not a comment, because it is not a comment line; only detection leaves it
  out. [fixture: common/error-trailing-percent]
- `error%%{wrap}%%` gives the one token `error`, followed by the `Directive`
  token of the directive. [fixture: common/error-directive-adjacent]
- `error %%{init: {}}%% %% x` followed by a line break gives `error`, `%%`, and
  `x`, with the `Directive` token of the directive between the first two.
  [fixture: common/error-directive-inside]
- `error`, a line break, `%% c`, a line break, and `%%{ }` followed by a line
  break gives `error`, `%%{`, and `}`, with the comment `%% c` between the first
  two, outside the tokens: `%%{ }` is not a directive and not a comment line.
  [fixture: common/error-comment-inside]
- `error %% style:#f;` followed by a line break gives `error`, `%%`, `style:#f`,
  and `;`. The line rule ignores the `;`, and no character of the run follows
  it, so it is a token of its own. `error %% style:#f;x` gives the last token
  `style:#f;x`, with the ignored `;` inside it. [fixture:
  common/error-style-semicolon-trailing] [fixture:
  common/error-style-semicolon-inside]

A directive inside the word, as in `err%%{init: {}}%%or`, is left out by
detection, which sees `error`, so the input is the `error` pseudo-diagram, as in
mermaid.js; the directive cuts the run into the tokens `err` and `or`, with its
`Directive` token between them. [fixture: common/error-split-by-directive]

## Shared leaf nodes

The names and values that an author writes are leaf nodes, each with its own
range, so that a tool can report on one or rewrite it without searching the
tokens. The type of each is decided by what the grammar allows to be written at
its position, not by what a written example looks like: the `x` of `accTitle: x`
looks like one word, but the position allows a text with whitespace, so it is a
literal.

- A position where the grammar reads a name, or allows only a single word
  without quotes, such as the value of a property: an [Identifier](#identifier).
- A position where the grammar asks for a string in quotes: a
  [StringLiteral](#stringliteral).
- A position where the grammar asks for a number: a
  [NumericLiteral](#numericliteral).
- A position where the grammar allows a text without quotes that may contain
  whitespace, and decides where it ends: a literal of the diagram type, such as
  [FlowchartLiteral](./ast/flowchart.md#flowchartliteral).
- A position where the grammar allows a text, a string in quotes, a markdown
  string, or a sequence of them, and which of them is written matters as a kind:
  a label of the diagram type, such as
  [FlowchartLabel](./ast/flowchart.md#flowchartlabel), a node with its kind and
  its value.

The first three have the same form in every diagram type, so they are defined
here and their names have no diagram prefix. How a text without quotes or a
label is read, for example whether it keeps the whitespace at its ends, differs
from one diagram type to another, so each diagram document defines its own
literal and label. None of the three nodes defined here has child fields. Words
from a fixed set, such as a direction, a shape name, or the marker at an end of
an arrow, stay strings in the fields of the diagram's nodes, as the `kind` of
ESTree's nodes does. An arrow is a node of the diagram, such as
[FlowchartArrow](./ast/flowchart.md#flowchartarrow) and
[SequenceArrow](./ast/sequence.md#sequencearrow), whose `value` is its text and
whose markers and line are such words, so that a tool reads them without reading
the characters of the arrow again; the diagrams use the same field names and the
same words for the same things (`startMarker`, `endMarker`, and `line`; `none`,
`arrow`, `cross`, `solid`, and `dotted`), and each diagram document defines its
own. Each diagram document says which of its fields hold which of these nodes
and which units each one is made of.

Text that the author writes but that the diagram does not read, and that has no
effect, is a leaf node too, of a type of the diagram that says so, such as
[FlowchartIgnoredText](./ast/flowchart.md#flowchartignoredtext), so that a tool
can find it without searching the tokens. Making such text a node comes before
rejecting the input: a diagram document rejects an input because of such text
only where the tree has no place for a node of it, and then as a known
divergence (see [known-divergences.md](./known-divergences.md)).

`Identifier` is also the name of a token kind, as in ESTree and ESLint, but a
node and a token are different things. The node is reached from `Root.body`
through child fields, and its `name` is the texts of its units joined in order
(see [Identifier](#identifier)), without the directives in them. A token is only
in `Root.tokens`, and its `value` is the source text of its range.
`A%%{init: {}}%%B-->C` has one `Identifier` node with the name `AB`, and two
`Identifier` tokens, `A` and `B`, with a `Directive` token between them.
[fixture: flowchart/gram-id-across-directive]

### Identifier

A name, or a single word without quotes at a position where the grammar allows
nothing else, such as the value of a property. A name is a word that the grammar
reads as a name at its position, such as an id or a class name; the grammar of
that position decides which characters it may contain, so a callback name may
contain whitespace, and a click id or an edge id other symbols. As in ESTree,
whether something is an identifier is a matter of its syntactic form: it need
not refer to anything, as the key of an object and the `prop` of `obj.prop` do
not.

| Field  | Type   | Meaning                                              |
| ------ | ------ | ---------------------------------------------------- |
| `name` | string | The texts of its units, joined in order (see below). |

Its `name` is made from the units of the diagram's lexer that it consists of
(units are defined by each diagram document): the text of the range of each unit
(see [Nodes](#nodes)), without the whitespace at its ends, joined in order.
Whitespace inside one unit is part of the name, also next to a directive that
cuts the unit; whitespace between two units is not. Its tokens are `Identifier`
tokens: one for each unit, or more when a directive inside a unit cuts it (see
[common.md](./common.md#a-directive-is-a-token-boundary)), and fewer where a
diagram joins units into one token.

- `A%%{init: {}}%%B-->C` has the vertex `AB`, whose Identifier is one unit cut
  into the two tokens `A` and `B`. [fixture: flowchart/gram-id-across-directive]
- In a class diagram, `class Foo Bar` declares a class whose Identifier has the
  two units and tokens `Foo` and `Bar` and the name `FooBar`, and so does
  `class Foo%%{init: {}}%% Bar`. [fixture: class/gram-name-spaces] [fixture:
  class/lex-directive-between-name-parts]
- In sequence, an id is one unit, which may contain whitespace:
  `participant A B` has the participant `A B`, and
  `participant A%%{init: {}}%% c%%B` the participant `A c%%B`, whose one unit is
  cut into the tokens `A` and `c%%B`. [fixture: sequence/lex-id-context-space]
  [fixture: sequence/lex-directive-in-id-before-space]

Its range covers all its tokens.

### StringLiteral

A string in quotes: double quotes, or, for the backquoted names of class
diagrams, backquotes.

| Field    | Type    | Meaning                                                                                                                                                                                                                                                                                            |
| -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`  | string  | Its content: what the diagram's string rules read between its delimiters, as the text of its range. With one pair of quotes, it is the text of its range without them; where a diagram nests delimiters, all of them are left out (for flowchart, see [Strings](./diagrams/flowchart.md#strings)). |
| `raw`    | string  | The source text of its range, with nothing left out and nothing converted: its quotes, and a comment region inside it, are part of it.                                                                                                                                                             |
| `closed` | boolean | Whether the string ends with its closing quote.                                                                                                                                                                                                                                                    |

Its token is one `String` token, quotes included, and its range is that of the
token, so `raw` equals the `value` of that token. `click A href "u"` has the URL
with the value `u` and the `raw` `"u"`; in `click A "u" "one`, a line break,
`%% c`, a line break, and `two"`, the tooltip has the value `one`, a line feed,
and `two`, and its `raw` is the whole string, the comment line included.
[fixture: flowchart/gram-click-href] [fixture:
flowchart/tokens-string-literal-comment-line]

A string is closed by its second quote. Where a diagram accepts a string that is
not closed when the text ends, which only a backquoted name in a class diagram
is (see
[Strings, backquoted names, and generic types](./diagrams/class.md#strings-backquoted-names-and-generic-types)),
its token and its range run to the last character of the source that is not
whitespace or a line terminator, as every token ends (see
[Invariants](#invariants)); line feeds inside it are part of it. Its `raw` has
no closing quote, and its `value` is the text of its range without the opening
quote. Its `closed` is false, as the `closed` of a [Directive](#directive) and
of a description block such as
[FlowchartAccDescrBlockStatement](./ast/flowchart.md#flowchartaccdescrblockstatement)
is for those that are not closed; every other StringLiteral has `closed` true. A
tool reads whether a string is closed from this field, and need not compare the
characters of `raw`: a backquote alone before the end of the text is a
backquoted name that is not closed, although its `raw` starts and ends with a
backquote. [fixture: class/lex-backquote-unclosed-alone] [fixture:
class/lex-backquote-unclosed] [fixture:
class/tokens-backquote-unclosed-trailing-whitespace]

### NumericLiteral

A number.

| Field   | Type   | Meaning                                              |
| ------- | ------ | ---------------------------------------------------- |
| `value` | number | The number that the characters of its token write.   |
| `raw`   | string | The source text of its range: the number as written. |

Its token is one `Numeric` token, and its range is that of the token, so `raw`
equals the `value` of that token: in `linkStyle 0,1 stroke:red`, the first
number has the value zero and the `raw` `0`. [fixture:
flowchart/db-linkstyle-shared-fill] Which forms a number may take is decided by
the grammar of its position: in flowchart only digits, so every number is an
integer; in sequence also a fraction, so `autonumber .5` starts at the number
one half, with the `raw` `.5`, and `autonumber 05` at five. [fixture:
sequence/db-autonumber-fraction] [fixture: sequence/db-autonumber-leading-zero]

## Diagram nodes

The nodes of each diagram type, with their fields and child fields, and which
characters of the diagram form tokens of which kind, are defined in a document
of their own under `ast/`:

- [Flowchart](./ast/flowchart.md): the diagram types `flowchart-v2`,
  `flowchart-elk`, and `swimlane`.
- [Sequence](./ast/sequence.md): the diagram type `sequence`.
- [Class](./ast/class.md): the diagram type `classDiagram`.

The name of every node type of a diagram type starts with the name of the
diagram type, such as `FlowchartVertex`, because node types share one set of
names across all diagram types. The [shared leaf nodes](#shared-leaf-nodes) and
the token kinds above are shared by all diagram types and have no prefix.
