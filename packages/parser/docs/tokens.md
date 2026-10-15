# Tokens of the tree

Japanese version: [tokens.ja.md](./tokens.ja.md)

This document defines the tokens in the tree that `@mmd-toolkit/parser`
produces, and the lists of the root. The shape of the tree is defined by the
specification in [`ast.md`](../../spec/docs/ast.md); the positions are defined
in [positions.md](./positions.md).

## Design goals

- **Lists of tokens and comments.** As in ESLint, the root holds every token in
  source order in `tokens` and every comment in `comments`. Every character that
  is not whitespace or a line terminator is in a token or a comment, as tools
  built for ESLint expect. A directive is a token too, of the kind `Directive`,
  and so are the delimiters and the body of the frontmatter; the root also lists
  directives and the frontmatter as records with fields of their own, in
  `directives` and `frontmatter`. Comments are not tokens.

## Tokens

A token is one lexical unit of the diagram, as the diagram's lexer reads it, or
a directive or a part of the frontmatter (see
[Directives and frontmatter](../../spec/docs/ast.md#directives-and-frontmatter)).
The tokens are listed in `Root.tokens`; they are not nodes and are not the
values of node fields.

| Field   | Type        | Meaning                                        |
| ------- | ----------- | ---------------------------------------------- |
| `type`  | string      | The token kind, one of the kinds listed below. |
| `value` | string      | The source text of `range`, as written.        |
| `range` | offset pair | Where the token is in the source.              |
| `loc`   | location    | The same place as lines and columns.           |

`value` is the source text of the token's range, as ESLint's tokens have it. The
conversions of [common.md](../../spec/docs/common.md) do not apply to it:
reading a line terminator as `\n`, an attribute quote as `'`, or an entity as
its placeholder. [fixture: flowchart/lex-lone-cr-directive-lf-label] [fixture:
class/db-class-def-attribute-quote] [fixture: class/db-acc-title-entity]
[fixture: class/tokens-string-crlf-in-note] A comment region and a `;` that the
line rule ignores lie inside no token: each cuts a token that it would lie
inside (see [Comment](#comment) and below). [fixture:
flowchart/tokens-comment-region-after-opening-quote] [fixture:
common/entity-css-in-string-label] The values of nodes skip those, but are not
converted either (see [Nodes](../../spec/docs/ast.md#nodes)).

The token kinds are these, and only these. Each diagram document says which
kinds its tokens have; a kind is added here when a diagram needs it.

| Kind               | Used by                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Meaning                                                                                                                                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`          | [flowchart](./tokens/flowchart.md#tokens), [sequence](./tokens/sequence.md#tokens), [class](./tokens/class.md#tokens), [state](./tokens/state.md#tokens), [er](./tokens/er.md#tokens), [gantt](./tokens/gantt.md#tokens), [journey](./tokens/journey.md#tokens), [requirement](./tokens/requirement.md#tokens), [mindmap](./tokens/mindmap.md#tokens), [timeline](./tokens/timeline.md#tokens), [sankey](./tokens/sankey.md#tokens), [xychart](./tokens/xychart.md#tokens), [quadrant](./tokens/quadrant.md#tokens)                                                                                                                             | A word with a fixed meaning at its position.                                                                                                                                                                                        |
| `Identifier`       | [flowchart](./tokens/flowchart.md#tokens), [class](./tokens/class.md#tokens), [state](./tokens/state.md#tokens), [er](./tokens/er.md#tokens), [gantt](./tokens/gantt.md#tokens), [requirement](./tokens/requirement.md#tokens), [quadrant](./tokens/quadrant.md#tokens)                                                                                                                                                                                                                                                                                                                                                                         | A name that the author chooses.                                                                                                                                                                                                     |
| `Numeric`          | [flowchart](./tokens/flowchart.md#tokens), [sequence](./tokens/sequence.md#tokens), [state](./tokens/state.md#tokens), [xychart](./tokens/xychart.md#tokens)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | A number.                                                                                                                                                                                                                           |
| `String`           | [flowchart](./tokens/flowchart.md#tokens), [class](./tokens/class.md#tokens), [state](./tokens/state.md#tokens), [er](./tokens/er.md#tokens), [gantt](./tokens/gantt.md#tokens), [requirement](./tokens/requirement.md#tokens), [mindmap](./tokens/mindmap.md#tokens), [sankey](./tokens/sankey.md#tokens), [xychart](./tokens/xychart.md#tokens), [quadrant](./tokens/quadrant.md#tokens)                                                                                                                                                                                                                                                      | A quoted string, with its quotes.                                                                                                                                                                                                   |
| `StringFragment`   | [flowchart](./tokens/flowchart.md#tokens), [class](./tokens/class.md#tokens), [state](./tokens/state.md#tokens), [er](./tokens/er.md#tokens), [gantt](./tokens/gantt.md#tokens), [requirement](./tokens/requirement.md#tokens), [mindmap](./tokens/mindmap.md#tokens), [sankey](./tokens/sankey.md#tokens), [xychart](./tokens/xychart.md#tokens), [quadrant](./tokens/quadrant.md#tokens)                                                                                                                                                                                                                                                      | A fragment of a quoted string that a comment region, an ignored `;`, or a directive cuts: the text before or after it, without the closing or the opening quote (see [Comment](#comment), and below for the `;` and the directive). |
| `RawText`          | every diagram (the frontmatter body), the `error` pseudo-diagram (see [ErrorDiagram](../../spec/docs/ast.md#errordiagram)), [flowchart](./tokens/flowchart.md#tokens), [sequence](./tokens/sequence.md#tokens), [class](./tokens/class.md#tokens), [state](./tokens/state.md#tokens), [er](./tokens/er.md#tokens), [gantt](./tokens/gantt.md#tokens), [journey](./tokens/journey.md#tokens), [requirement](./tokens/requirement.md#tokens), [mindmap](./tokens/mindmap.md#tokens), [timeline](./tokens/timeline.md#tokens), [sankey](./tokens/sankey.md#tokens), [xychart](./tokens/xychart.md#tokens), [quadrant](./tokens/quadrant.md#tokens) | Characters that the parser takes as one content without reading any structure in them, not enclosed in quotes (enclosed, they are a `String`), such as the text of a label or a style.                                              |
| `Punctuator`       | every diagram (the frontmatter delimiters), [flowchart](./tokens/flowchart.md#tokens), [sequence](./tokens/sequence.md#tokens), [class](./tokens/class.md#tokens), [state](./tokens/state.md#tokens), [er](./tokens/er.md#tokens), [gantt](./tokens/gantt.md#tokens), [journey](./tokens/journey.md#tokens), [requirement](./tokens/requirement.md#tokens), [mindmap](./tokens/mindmap.md#tokens), [timeline](./tokens/timeline.md#tokens), [sankey](./tokens/sankey.md#tokens), [xychart](./tokens/xychart.md#tokens), [quadrant](./tokens/quadrant.md#tokens)                                                                                 | A delimiter, separator, or operator, such as `[` or `-->`.                                                                                                                                                                          |
| `Directive`        | every diagram                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | A directive (see [Directive](../../spec/docs/ast.md#directive)).                                                                                                                                                                    |
| `IgnoredSemicolon` | every diagram, the `error` pseudo-diagram                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | A `;` that the [`style` and `classDef` line rule](../../spec/docs/common.md#style-and-classdef-lines) ignores. mermaid.js removes it from the text, and no grammar reads it.                                                        |

Which characters form a token, and of which kind, is defined by each diagram
document, except for the `Directive` tokens, the `StringFragment` tokens, the
`IgnoredSemicolon` tokens, and the tokens of the frontmatter, which are the same
in every diagram. A `String` token of a string that is not closed has no closing
quote (see [StringLiteral](../../spec/docs/ast.md#stringliteral)): whether a
string has both quotes is told by the `closed` field of its StringLiteral, not
by the kind of its tokens. [fixture: class/lex-backquote-unclosed-alone]

Whitespace and line terminators are a token on their own only where mermaid.js
reads them as a value, or as a part of a value between two places where a
directive, a comment region, or an ignored `;` cuts it, or between such a place
and an end of the value (below). [fixture: class/db-generic-blank] [fixture:
flowchart/tokens-directives-label-space-between] [fixture:
sequence/tokens-title-directive-then-spaces] [fixture:
state/tokens-alias-ignored-semicolon-then-spaces] [fixture:
flowchart/comment-lines-after-separator-0e277222] Where the diagram's grammar
gives a line terminator meaning, for example as the end of a statement, the
lexer reads it, but no token or node is made for it; what it separates shows in
the structure of the tree, such as the list of statements. [fixture:
common/crlf] Where whitespace or line terminators lie inside the range of a
token, as in the text of a label or a multi-line quoted string, they are part of
that token. [fixture: flowchart/db-subgraph-title-inner-spaces] [fixture:
class/lex-string-multi-line] How the lexer reads a line terminator is a rule of
[Line terminators](../../spec/docs/common.md#line-terminators), not a matter of
tokens.

The tokens of a value cover the text that mermaid.js reads as that value: the
first token starts where that text starts, and the last token ends where it
ends. So whitespace and line terminators that mermaid.js reads at the start or
the end of a value are part of the value's tokens, and a value that mermaid.js
reads as whitespace only has tokens of that whitespace, of the kind that the
diagram gives a value at that position. [fixture: class/db-generic-spaces]
[fixture: class/tokens-callback-arguments-line-feeds-at-ends] [fixture:
class/db-generic-blank] Whitespace and line terminators that mermaid.js does not
read as part of a value, such as those around a keyword or around a value whose
ends mermaid.js trims, belong to no token. [fixture: state/db-label-trimmed]
This holds also where a directive, a comment region, or an ignored `;` cuts a
value: the whitespace and line terminators next to the cut that mermaid.js reads
as part of the value belong to the fragment next to them, so that no character
that mermaid.js reads as part of the value lies outside its tokens: in a class
diagram, `style A fill:#f00,color ;:blue` has the tokens `fill:#f00,color` with
the space after it, the `IgnoredSemicolon` token, and `:blue`, and so does
`classDef c fill:#f00,color ;:blue`. [fixture:
class/tokens-style-ignored-semicolon-after-space] [fixture:
class/tokens-class-def-ignored-semicolon-after-space] This holds for the text
that mermaid.js reads as a value. A node of text that mermaid.js does not read
(see [Nodes](../../spec/docs/ast.md#nodes)), such as a StateIgnoredText, has the
tokens of its units, and the whitespace and line terminators between its units
belong to no token, although they are part of its value: the `textBeforeBody` of
`state "d" as A`, a line `state %% c`, and a line `state {` has the `Keyword`
tokens `state` and `state`, with the comment between them, and the value
`state`, a space, a line feed, two spaces, and `state`. [fixture:
state/tokens-ignored-text-comment-between-units] The diagram documents state, at
each position, which text mermaid.js reads as the value; this document states
only that the tokens of a value cover it.

The lexer reads through a `;` that the
[`style` and `classDef` line rule](../../spec/docs/common.md#style-and-classdef-lines)
ignores as if it were not there, so the tokens around it are found as if it were
absent. The `;` itself is a token of its own, of the kind `IgnoredSemicolon`, in
every diagram, and no other token spans it: where characters of one token lie on
both sides of it, it cuts that token, as a comment region does (see
[Comment](#comment)), into fragments of the same kind, and the fragments of a
`String` token are `StringFragment` tokens. Only a `RawText` token and a
`String` token may be cut so; inside a token of any other kind, a name, a
number, a keyword, an arrow, or another delimiter, the `;` makes the input
rejected (see
[`style` and `classDef` lines](../../spec/docs/common.md#style-and-classdef-lines)),
and the error is at the `;` (see
[Known divergences](./error-positions.md#known-divergences)). [fixture:
flowchart/div-ignored-semicolon-in-id] [fixture:
sequence/div-ignored-semicolon-in-autonumber-start] [fixture:
flowchart/div-ignored-semicolon-in-keyword] [fixture:
flowchart/div-ignored-semicolon-in-arrow] [fixture:
flowchart/div-ignored-semicolon-in-triple-colon] In
`A["<span style='color:#f00;font-weight:bold;'>x</span>"]` in flowchart, the
line rule ignores the `;` after `bold`, and the label has the `StringFragment`
tokens `"<span style='color:#f00;font-weight:bold` and `'>x</span>"`, with the
`IgnoredSemicolon` token between them. [fixture:
common/entity-css-in-string-label] An `IgnoredSemicolon` token is the token of
no node, and may lie inside the range of a node, between two of its tokens (see
[Nodes](../../spec/docs/ast.md#nodes)); the written text of a value leaves it
out, so no value of a node holds it. The kind tells an ignored `;` from a `;`
that the grammar reads: in flowchart, `style A fill:#f00;` ends in the
`IgnoredSemicolon` token `;`, which the line rule ignores, and
`style A fill:red;` in the `Punctuator` token `;`, the separator of the
statement. [fixture: flowchart/tokens-style-semicolon-ignored] [fixture:
flowchart/tokens-style-semicolon-separator] The grammar does not read an ignored
`;`, so it never makes a node: in flowchart, only a `;` that the grammar reads
as a line of its own makes an empty statement. In the `error` pseudo-diagram,
for example, `style:#f;` at the end of a line is the `RawText` token `style:#f`
followed by the `IgnoredSemicolon` token `;`, and `style:#f;x` is the `RawText`
tokens `style:#f` and `x` with the `IgnoredSemicolon` token between them (see
[ErrorDiagram](../../spec/docs/ast.md#errordiagram)). [fixture:
common/error-style-semicolon-trailing] [fixture:
common/error-style-semicolon-inside]

## The lists of the root

`Root` has these fields besides those of
[`ast.md`](../../spec/docs/ast.md#root):

| Field      | Type            | Meaning                                                                                      |
| ---------- | --------------- | -------------------------------------------------------------------------------------------- |
| `comments` | list of Comment | Every comment, in source order.                                                              |
| `tokens`   | list of Token   | Every token, `Directive` tokens and the tokens of the frontmatter included, in source order. |

`comments` and `tokens` are lists, not child fields. Every character that is not
whitespace or a line terminator is in `tokens` or `comments`, so a tool that
goes through tokens and comments together, as ESLint's `SourceCode` does, finds
no gap at a directive or at the frontmatter. [fixture:
common/config-directive-after-frontmatter]

## Comments

Comments are records in `Root.comments`: no node holds them, and a tool that
walks the tree does not visit them. Every record, a comment, a directive, or the
frontmatter, has a `range` and a `loc`, and its text is the source text of its
range. A comment is not a token. A directive that lies outside every token and
every comment is also a token in `Root.tokens`, of the kind `Directive`, with
the same range as the record. The frontmatter is two or three tokens, which
divide its range (see [Frontmatter tokens](#frontmatter-tokens)). A directive's
record and its token have the same name, as `Identifier` names both a node and a
token kind, and they hold different things under `value`: the record its content
(see [Directive](../../spec/docs/ast.md#directive)), and the token the source
text of its range, as every token does. [fixture:
common/comment-after-directive] [fixture:
common/config-directive-after-frontmatter]

### Comment

`type` is `Comment`.

| Field   | Type                               | Meaning                                                                                                                    |
| ------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `mark`  | one of `%%`, `#`, and `%`, or null | The comment's mark: `%%` for a comment line, or the mark of a diagram comment. Null for a fragment after a comment region. |
| `value` | string                             | The source text after the mark; for a fragment without a mark, the source text of its range.                               |

`mark` holds the characters of the mark, which are not always the source text at
the start of the range: in `%%%{init: {}}%%% c`, the mark is `%%`, made of the
first and the last `%`, with a directive between them. The marks are these
three: `%%`, of a comment line and of some diagram comments, and `#` and `%`, of
diagram comments; a diagram type whose comments have another mark adds it to
them. Which marks the diagram comments of a diagram type have is defined by its
diagram's document, such as `#`, `%%`, and `%` in
[sequence](../../spec/docs/diagrams/sequence.md#units-and-contexts). A tool
reads whether a comment has a mark, and which, from this field. [fixture:
common/comment-percent-joined-by-directive] [fixture:
sequence/lex-single-percent-comment] [fixture:
state/lex-diagram-comment-across-comment-line]

A comment line produces a `Comment`, and so does a **diagram comment**: text
that a diagram's own lexer reads as a comment, which its document defines, such
as a `#` or a `%%` in the middle of a line in
[sequence](../../spec/docs/diagrams/sequence.md#the-statement-context). The
range starts at the mark, the first `%` of the `%%` of a comment line or the
mark of a diagram comment, and ends before the line terminator, or, where the
diagram's document ends a diagram comment at the end of its line segment, as
[mindmap](../../spec/docs/diagrams/mindmap.md#comments) does, before the U+2028
or U+2029 that ends it; a comment starts at its mark, and no character before
the mark is part of it. [fixture: common/comment-after-directive] [fixture:
sequence/lex-hash-ends-text] [fixture: sequence/lex-percent-comment-after-unit]
[fixture: mindmap/lex-comment-ends-at-line-separator] A fragment of a diagram
comment after a comment region is the exception (see below). The whitespace-only
lines and the line terminator that the comment region also covers are whitespace
and line terminators. [fixture: common/comment-blank-line-before-in-string] A
directive in a comment can take the line terminators after it, so that the
comment runs on past them (see
[Comment lines](../../spec/docs/common.md#comment-lines)). Where it takes all
that follows, to the end of the text, the comment ends where the directive ends:
the whitespace that the directive scan takes after the argument is outside the
directive's range (see [Directive](../../spec/docs/ast.md#directive)), and
outside the comment's too, so no comment ends with a line terminator. In
`%% %%{init: {}` followed by a space and blank lines at the end of the text, the
comment is `%% %%{init: {}`, as the directive is `%%{init: {}`, and so it is
with a line feed at the end and with `%% %%{wrap`, a line `A`, and a line of a
space. After a closed directive the scan takes no whitespace, so
`%% %%{init: {}}%%` followed by two spaces and a line break is a comment with
the two spaces, as any comment keeps the whitespace before its line terminator.
[fixture: common/comment-directive-unclosed-trailing-blank-lines] [fixture:
common/comment-directive-unclosed-line-feed-at-end] [fixture:
common/comment-directive-word-argument-trailing-blank-line] [fixture:
common/comment-directive-closed-then-spaces] A diagram comment is found, as
tokens are, as if a `;` that the line rule ignores were not there (see
[Tokens](#tokens)): such a `;` lies inside the comment when characters of the
comment lie on both sides of it, and otherwise it is an `IgnoredSemicolon`
token. At the end of `A->>B: x #style:#x;` in sequence, the comment is
`#style:#x`, and the `;` after it is an `IgnoredSemicolon` token. In every
diagram but agentflow, a comment line never holds such a `;`, because the line
rule leaves comment regions out of its line segments (see
[`style` and `classDef` lines](../../spec/docs/common.md#style-and-classdef-lines)).
[fixture: sequence/tokens-comment-then-ignored-semicolon] A diagram whose Db
sets
[`preserveCommentsWhenParsing`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/Diagram.ts#L66-L76)
(agentflow in the pinned mermaid.js) sees comment lines in its parser input; its
document says how the tree represents them. A `%%` that is not a comment line,
such as a trailing `%%` after a statement or a line containing only `%%`, is
[diagram text](../../spec/docs/common.md#reading-a-source), which the diagram's
lexer reads: it is part of a token, or a diagram comment where the diagram's
document makes it one, as a line of only `%%` in class. [fixture:
common/comment-mid-line-style] [fixture: common/comment-bare] [fixture:
class/lex-bare-percent-line-between-statements] Before the header, such a line
is a bare `%%` line, which detection passes and the diagram's lexer does not
read again: in every diagram type it is a diagram comment with the mark `%%`,
from its `%%` to the end of its line (see
[Diagram detection](../../spec/docs/common.md#diagram-detection)). [fixture:
sequence/header-after-bare-percent-line] [fixture:
class/header-after-empty-braces-line] [fixture:
state/header-after-bare-percent-line] [fixture:
flowchart/header-after-bare-percent-line]

A comment region can also lie inside a diagram comment, which runs to the end of
its line: a comment line that follows a U+2028 or U+2029 on that line is gone
when mermaid.js reads it, so the line goes on after the comment line. The region
cuts the diagram comment as it cuts a token (see
[Comment regions in tokens](#comment-regions-in-tokens)): each fragment, the
text before the region or after it without the whitespace and line terminators
next to the region, is a `Comment`, and a fragment that is empty or all
whitespace is none. The last fragment keeps the whitespace before its line
terminator, as any comment does: in state, `state X ""` with ` %% c`, U+2028, a
line `%% d`, and a line of `x` and a space has the comments `%% c`, `%% d`, and
`x` followed by the space, while a space before the U+2028, or two spaces at the
start of the line after the region, lie in no comment. [fixture:
state/tokens-ignored-text-comment-cut-fragment-trailing-space] [fixture:
state/tokens-ignored-text-comment-cut-space-before-separator] [fixture:
state/tokens-ignored-text-comment-cut-spaces-after-region] The fragment after
the region has no mark, and its `mark` is null: its range starts at its first
character, and its value is the source text of its range. In state, `A %% x`,
U+2029, a line `%% end`, and a line `B` have the comments `%% x`, `%% end`, and
`B`, in this order, and the only state A; with an empty line before `B`, the
diagram comment ends at the line feed after `%% end`, and B is a state. Without
the comment line, `A %% x`, U+2029, and `B` is one comment, since U+2029 does
not end a diagram comment. [fixture:
state/lex-diagram-comment-across-comment-line] [fixture:
state/lex-hash-comment-across-comment-line] [fixture:
state/lex-diagram-comment-across-comment-line-after-line-separator] [fixture:
state/lex-diagram-comment-across-two-comment-lines] [fixture:
state/lex-diagram-comment-across-blank-and-comment-line] [fixture:
state/lex-diagram-comment-across-init-comment-line] [fixture:
sequence/lex-hash-comment-across-comment-line] [fixture:
state/lex-diagram-comment-empty-line-after-comment-line] [fixture:
state/lex-diagram-comment-paragraph-separator-without-comment-line] Whether a
`;` that the line rule ignores lies inside a diagram comment (see above) is
decided once, on the whole comment before a region cuts it: it lies inside when
characters of the comment lie on both sides of it, whitespace included, among
them the characters of its line after the region and a U+2028 or U+2029 before
the region. Then the region cuts the comment. So in state, `A %% style:#x;`,
U+2029, and a line `%% end` have the comment `%% style:#x;`, with the `;`, as
`A %% style:#x;` followed by two spaces has, and with a space before the `;` the
comment is `%% style:#x ;`. [fixture:
state/tokens-ignored-semicolon-in-comment-before-comment-line] [fixture:
state/tokens-ignored-semicolon-after-space-in-comment-before-comment-line]
[fixture: state/tokens-ignored-semicolon-in-comment-across-comment-line]
[fixture: state/tokens-ignored-semicolon-in-comment-before-spaces]

A directive after the `%%` of a comment line lies inside the comment's range,
and mermaid.js still reads it for configuration (see
[The configuration scan](../../tests/docs/configuration.md#the-configuration-scan)).
[fixture: common/directive-in-comment] A directive before the comment's `%%`, as
in `%%{init: {}}%% %% note`, lies outside the comment, which starts at its `%%`.
[fixture: common/comment-after-directive] In `%%%{init: {}}%%% c`, the comment's
`%%` is the first and the last `%`, so the directive between them lies inside
the comment's range, and the comment's `value` is a space and `c`. [fixture:
common/comment-percent-joined-by-directive] The same holds for a diagram comment
whose mark is `%%`: its mark is found in the text without directives, a
directive may lie between its two `%`, and its `value` is the source text after
the mark, directives included (see
[sequence](../../spec/docs/diagrams/sequence.md#units-and-contexts)). [fixture:
sequence/lex-diagram-comment-directive-between-marks] [fixture:
sequence/lex-diagram-comment-directive-after-single-mark] A directive after the
mark of any diagram comment lies inside the comment's range and has no
`Directive` token: at the end of `A->>B: x #c %%{init: {}}%%` in sequence, the
comment runs from `#` to the closing `%%`, and so it does from `%%` in
`A --> B %% c %%{init: {}}%%` in state. [fixture:
sequence/tokens-diagram-comment-directive-at-end] [fixture:
state/tokens-diagram-comment-directive-at-end]

## Comment regions in tokens

A comment lies outside all tokens. A comment region can lie inside what one unit
reads, for example a `%%` comment line inside a multi-line quoted label: the
lexer reads through the region, so the unit continues after it (see
[Comment lines](../../spec/docs/common.md#comment-lines)), but its token is cut
at the region. Each **fragment** is the text of the token before the region, or
after it, with the whitespace and line terminators next to the region that
mermaid.js reads as part of the value, such as the line terminator before the
region (see [Tokens](#tokens)); the region, with its whitespace-only lines and
the line terminator that ends its comment, is outside every token. A fragment
that is empty is no token, [fixture:
flowchart/tokens-rawtext-comment-line-then-closing-bracket] and neither is one
of whitespace and line terminators only that mermaid.js does not read as part of
the value, such as one at the start of a label whose ends mermaid.js trims.
Where several regions lie inside one token, it is cut at each. [fixture:
flowchart/tokens-string-two-comment-lines] [fixture:
flowchart/tokens-rawtext-two-comment-lines] Only `String` and `RawText` tokens
can hold a comment region, because only their units may span lines. The
fragments of a `String` token are `StringFragment` tokens; the fragments of a
`RawText` token are `RawText` tokens, as the fragments of a token that a
directive cuts keep its kind (see
[Directive](../../spec/docs/ast.md#directive)). The node of the unit, such as a
label, a StringLiteral, or a literal, spans the fragments and the region, and
its value is the text before and after the region joined, as before. In
`A["one`, a line `%% two`, and a line `three"]`, the label has the
`StringFragment` tokens `"one` with the line feed after it, and `three"`, with
the comment between them, and the value `one`, a line feed, and `three`; in
`A["`, a line `%% c`, and a line `b"]`, the fragments are `"` with a line feed,
and `b"`; and in `A[`, a line `%% c`, and a line `b]`, the text before the
region is a line feed at the start of the label, which mermaid.js does not read
as part of it, so the label has the one `RawText` token `b`. [fixture:
common/comment-in-string] [fixture: common/comment-blank-line-before-in-string]
[fixture: flowchart/tokens-comment-region-after-opening-quote] [fixture:
flowchart/tokens-comment-region-at-label-start] A line with only `%%` is no
comment line (see [Comment lines](../../spec/docs/common.md#comment-lines)), so
it stays in a fragment: in `A[a`, a line `%% c`, a line `%%`, and a line `b]`,
the fragments are `a` with a line feed, and the text `%%`, a line feed, and `b`;
with the `%%` line before the comment line, they are `a`, a line feed, `%%`, and
a line feed, and `b`; and in the string `A["a`, a line `%% c`, a line `%%`, and
a line `b"]`, they are the `StringFragment` tokens `"a` with a line feed, and
`%%`, a line feed, and `b"`. [fixture:
flowchart/tokens-comment-region-then-bare-marker-line] [fixture:
flowchart/tokens-comment-region-after-bare-marker-line] [fixture:
flowchart/tokens-comment-region-then-bare-marker-line-in-string] Such regions
lie in quoted strings, in the text of labels and of edges, in description
blocks, in data blocks, in a callback name after `call`, in a backquoted name,
and in a note over lines. [fixture:
flowchart/tokens-string-literal-comment-line] [fixture:
flowchart/tokens-comment-region-in-subgraph-title-string] [fixture:
flowchart/tokens-comment-region-in-edge-text] [fixture:
flowchart/tokens-comment-region-in-dashed-edge-text] [fixture:
flowchart/tokens-comment-region-in-acc-descr-block] [fixture:
flowchart/tokens-comment-region-in-data-block] [fixture:
flowchart/tokens-comment-region-in-callback-name] [fixture:
sequence/tokens-comment-region-in-acc-descr-block] [fixture:
class/tokens-comment-region-in-acc-descr-block] [fixture:
class/tokens-comment-region-in-click-string] [fixture:
class/tokens-comment-region-in-backquoted-name] [fixture:
class/tokens-comment-region-in-callback-name] [fixture:
state/tokens-comment-region-in-alias-string] [fixture:
state/tokens-comment-region-in-note-block] [fixture:
state/tokens-comment-region-in-acc-descr-block]

## Directive tokens

A directive is a token boundary (see
[common.md](../../spec/docs/common.md#a-directive-is-a-token-boundary)), so it
lies inside no other token. A directive inside a comment has no `Directive`
token: its characters are in that comment. [fixture:
common/directive-in-comment] A directive in a comment region before the
comment's `%%` lies outside every token and comment, also where the region lies
inside what one unit reads, because the region cuts that unit's token (see
[Comment](#comment)), so it is a `Directive` token. [fixture:
common/comment-region-directive-in-string] [fixture:
common/comment-directive-in-string]

## Frontmatter tokens

The frontmatter record has this field besides those of
[`ast.md`](../../spec/docs/ast.md#frontmatter):

| Field        | Type        | Meaning                         |
| ------------ | ----------- | ------------------------------- |
| `valueRange` | offset pair | Where `value` is in the source. |

The range runs from the `---` of the opening delimiter line through the closing
`---`. The indent before the opening `---`, and the whitespace and blank lines
after the closing delimiter, which the frontmatter rule also covers, are
whitespace and line terminators. [fixture: common/frontmatter-indented]
[fixture: flowchart/demo-flowchart-4301e540]

The frontmatter's range holds these tokens, in this order: the opening `---`, a
`Punctuator` token; the body, a `RawText` token from the first character of the
body that is not whitespace to the last one, when the body is not all
whitespace; and the closing `---`, a `Punctuator` token. [fixture:
common/frontmatter-empty-body] [fixture: common/frontmatter-indented] Everything
else in the range is whitespace and line terminators: the whitespace after each
`---` on its line, the whitespace-only lines before the body, and the whitespace
at the start and the end of the body, the indent of its first line included.
[fixture: common/frontmatter-blanks-after-delimiters] [fixture:
common/frontmatter-blank-line-before-body] The indent of the other lines of the
body lies inside the body's token, and `value` keeps the body with all its
indents. [fixture: common/config-directive-after-frontmatter] A delimiter line
holds nothing but its indent, `---`, and line whitespace, so no other token lies
on it; U+2028 after a `---` is line whitespace. [fixture:
common/frontmatter-indented] [fixture: flowchart/frontmatter-title-crlf]
[fixture: common/frontmatter-bom-both-delimiters] [fixture:
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

## String tokens

A StringLiteral's token is one `String` token, quotes included, and its range is
that of the token, so `raw` equals the `value` of that token. [fixture:
flowchart/gram-label-space-string] Where comment regions, an ignored `;`, or
directives cut it, its tokens are `StringFragment` tokens, and its range runs
from the first of them to the last, the regions, the `IgnoredSemicolon` token,
and the `Directive` tokens included (see
[Comment regions in tokens](#comment-regions-in-tokens), [Tokens](#tokens), and
[A token that a directive cuts](#a-token-that-a-directive-cuts)): in
`click A "u" "one`, a line break, `%% c`, a line break, and `two"`, the
tooltip's tokens are the `StringFragment` tokens `"one` and `two"`, and in
`click A href "u%%{init: {}}%%v"`, the URL's tokens are the `StringFragment`
tokens `"u` and `v"`, with the `Directive` token between them. [fixture:
flowchart/tokens-string-literal-comment-line] [fixture:
flowchart/lex-directive-in-click-href-string] [fixture:
common/entity-css-in-string-label]

The token and the range of a string that is not closed run to the end of its
written text (see [StringLiteral](../../spec/docs/ast.md#stringliteral)). A
directive after that end lies outside the range, as a directive is the token of
no node: `A --> `, `` `b``, a space, and `%%{init: {}}%%` at the end of the text
has the one `String` token of `` `b`` and the space. [fixture:
class/lex-backquote-unclosed-directive-at-end] A directive inside it cuts it, as
a directive cuts every token whose range would hold it (see
[A token that a directive cuts](#a-token-that-a-directive-cuts)): any directive
within its range, as in a closed string. `class`, `` `a %%{init: {}}%% b``, and
a line break has the `StringFragment` token of the backquote, `a`, and a space,
and the one of a space, `b`, and the line break, with the `Directive` token
between them. [fixture:
class/tokens-backquote-unclosed-directive-between-spaces] In a class diagram,
`class`, `` `x%%{init: {}}%%y``, and a line break at the end of the text has the
`StringFragment` tokens `` `x`` and `y` with the line break, [fixture:
class/lex-backquote-unclosed-directive-inside] and `class`, `` `x``, a line
break, and `%%{init: {}}%%` followed by a line break has the `StringFragment`
tokens `` `x`` with the line feed after it, and the last line feed; in both, the
`Directive` token lies between them. [fixture:
class/lex-backquote-unclosed-directive-after-line-break]

## Numeric tokens

A NumericLiteral's token is one `Numeric` token, and its range is that of the
token, so `raw` is the source text of the token. [fixture: state/gram-scale] A
directive or a `;` that the line rule ignores inside a number makes the input
rejected (see
[A directive is a token boundary](../../spec/docs/common.md#a-directive-is-a-token-boundary)
and
[`style` and `classDef` lines](../../spec/docs/common.md#style-and-classdef-lines)).
[fixture: sequence/div-directive-in-number] [fixture:
sequence/div-ignored-semicolon-in-autonumber-start]

## Tokens of the error pseudo-diagram

Its tokens, besides the `Directive` tokens and the tokens of the frontmatter,
are made from the maximal runs of characters that are not whitespace or line
terminators in the text without its directives and comment regions; each is a
`RawText` token. [fixture: common/error-trailing-percent] Whitespace or a line
terminator ends a run, and a directive between two characters of a run cuts it,
as it cuts every token (see
[common.md](../../spec/docs/common.md#a-directive-is-a-token-boundary)).
[fixture: common/error-split-by-directive] A `;` that the line rule ignores is
an `IgnoredSemicolon` token, as in every diagram (see [Tokens](#tokens)): it is
part of no run, and it cuts a run that it lies inside into two `RawText` tokens.
[fixture: common/error-style-semicolon-inside] The node's tokens are its
`RawText` tokens, and its range runs from the start of the first to the end of
the last (see [Nodes](../../spec/docs/ast.md#nodes)). There is always at least
one: the characters of `error`, which detection found, lie in one token or, cut
by a directive, in several (see below). [fixture:
common/error-directive-adjacent] [fixture: common/error-split-by-directive]

The runs are made of the characters of the text, not of the
[diagram text](../../spec/docs/common.md#reading-a-source): a `;` that the line
rule ignores is not diagram text, but it is a token. [fixture:
common/error-style-semicolon-trailing] A comment is always outside the tokens,
because a comment region starts at a comment start, which is the start of the
text or right after a line terminator, U+2028, or U+2029, and each of those ends
a run. [fixture: common/error-comment-inside]

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
  and `;`, an `IgnoredSemicolon` token, because the line rule ignores the `;`.
  `error %% style:#f;x` gives `error`, `%%`, `style:#f`, `;`, and `x`: the
  ignored `;` cuts the run `style:#f;x`. [fixture:
  common/error-style-semicolon-trailing] [fixture:
  common/error-style-semicolon-inside]

A directive inside the word, as in `err%%{init: {}}%%or`, is left out by
detection, which sees `error`, so the input is the `error` pseudo-diagram, as in
mermaid.js; the directive cuts the run into the tokens `err` and `or`, with its
`Directive` token between them. [fixture: common/error-split-by-directive]

## Identifier tokens

`Identifier` is also the name of a token kind, as in ESTree and ESLint, but a
node and a token are different things. The node is reached from `Root.body`
through child fields, and its `name` is the texts of its units joined in order
(see [Identifier](../../spec/docs/ast.md#identifier)). A token is only in
`Root.tokens`, and its `value` is the source text of its range.

An Identifier's token is one `Identifier` token, whose range is that of the
node: no whitespace lies inside or between its units, and a directive or a `;`
that the line rule ignores inside it makes the input rejected (see
[A directive is a token boundary](../../spec/docs/common.md#a-directive-is-a-token-boundary)).
`A%%{init: {}}%%B-->C` is rejected at the directive. [fixture:
flowchart/div-directive-in-id] [fixture: flowchart/div-ignored-semicolon-in-id]

A name that may contain whitespace is a name node of the diagram type instead
(see [Shared leaf nodes](../../spec/docs/ast.md#shared-leaf-nodes)), and its
tokens are `RawText` tokens, which a directive or an ignored `;` may cut as any
text:

- In a class diagram, a ClassIdentifier has a `RawText` token for each run of
  its units with no whitespace between them; the whitespace between two runs,
  which mermaid.js does not read, is in no token. `class Foo Bar` declares the
  class `FooBar` with the tokens `Foo` and `Bar`, and so does
  `class Foo%%{init: {}}%% Bar`; `class A%%{init: {}}%%.B` declares the class
  `A.B` with the tokens `A` and `.B` and the `Directive` token between them. An
  ignored `;` cuts it in the same way: in `A "style:#x" --> B;C`, the class `BC`
  has the tokens `B` and `C` with the `IgnoredSemicolon` token between them.
  [fixture: class/gram-name-spaces] [fixture:
  class/lex-directive-between-name-parts] [fixture:
  class/lex-directive-in-dotted-name] [fixture:
  class/tokens-ignored-semicolon-in-relation-name]
- In a sequence diagram, a SequenceIdentifier has the one `RawText` token of its
  unit, the whitespace inside it included, which mermaid.js reads as part of the
  name: `participant A%%{init: {}}%% c%%B` has the participant `A c%%B` with the
  tokens `A` and ` c%%B` and the `Directive` token between them, and an ignored
  `;` cuts it in the same way: in
  `participant Z@{ "style": "x:#y" };participant B;C`, the participant `BC` has
  the tokens `B` and `C`. [fixture: sequence/lex-directive-in-id-before-space]
  [fixture: sequence/tokens-ignored-semicolon-in-participant-id]

## A token that a directive cuts

- A token whose range holds a directive is cut at the directive: a token whose
  unit has a directive inside it, a token of several units with a directive
  between two of them, and a token that runs past a directive to the whitespace
  at the end of a value, as the backquoted name of a class that is not closed
  can (see
  [Strings, backquoted names, and generic types](../../spec/docs/diagrams/class.md#strings-backquoted-names-and-generic-types)).
  [fixture: common/directive-in-string] [fixture:
  class/lex-directive-in-dotted-name] [fixture:
  class/lex-backquote-unclosed-directive-after-line-break] Only a `RawText`
  token and a `String` token may be cut; a directive inside a token of another
  kind makes the input rejected (see
  [A directive is a token boundary](../../spec/docs/common.md#a-directive-is-a-token-boundary)),
  as in `A(%%{init: {}}%%(x))`, where the two `(` of a circle are one
  `Punctuator` token. [fixture: flowchart/div-directive-in-circle-opening]
  [fixture: flowchart/div-directive-in-id] [fixture:
  sequence/div-directive-in-number] [fixture:
  flowchart/div-directive-in-keyword-href] [fixture:
  flowchart/div-directive-in-arrow-length] Each fragment, with the whitespace
  and line terminators next to the directive that mermaid.js reads as part of
  the value (see [Tokens](#tokens)), is a token of the same kind, except that
  the fragments of a `String` token are `StringFragment` tokens; a fragment of
  whitespace and line terminators only is a token too when mermaid.js reads it
  as part of the value, as between two directives, and no token otherwise. The
  directive between the fragments is a `Directive` token. What the token stood
  for, such as the value of a label or a participant id, does not change: the
  label of `A[x%%{init: {}}%% y]` has the tokens `x` and ` y`, and its value is
  `x`, a space, and `y`; with two directives and a space between them,
  `A[x %%{init: {}}%% %%{init: {}}%% y]`, the space between them is a token of
  its own; and the label of `A["a %%{init: {}}%% b"]` has the `StringFragment`
  tokens `"a ` and ` b"`, and its value is `a`, two spaces, and `b`. [fixture:
  flowchart/tokens-directive-label-space-after] [fixture:
  flowchart/tokens-directives-label-space-between] [fixture:
  common/directive-in-string]
