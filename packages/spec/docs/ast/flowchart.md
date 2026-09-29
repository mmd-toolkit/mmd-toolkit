# Flowchart nodes

Japanese version: [flowchart.ja.md](./flowchart.ja.md)

This document defines the nodes and tokens of the tree for the diagram types
`flowchart-v2`, `flowchart-elk`, and `swimlane`. The shared parts of the tree
are defined in [ast.md](../ast.md); how the source is read, and which grammar
rule makes which node, is defined in
[diagrams/flowchart.md](../diagrams/flowchart.md).

The body of these diagram types is a [FlowchartDiagram](#flowchartdiagram). The
values of the fields keep what the author wrote, as [ast.md](../ast.md#nodes)
defines the text of a range; they are not in the converted form of
[common.md](../common.md#reading-a-source), which the Db normalization of
[diagrams/flowchart.md](../diagrams/flowchart.md#building-the-summary-from-the-tree)
applies where it uses them. Whitespace outside the range of a node is not part
of its value; it matters to the Db in two places, the Db text of a style and the
name text of a subgraph, where the Db normalization reads it from the source.
The names and values that the author writes are the leaf nodes of
[ast.md](../ast.md#shared-leaf-nodes), chosen by the form in which they are
written, and a text without quotes is a [FlowchartLiteral](#flowchartliteral);
which grammar rule makes which node is in the table of
[diagrams/flowchart.md](../diagrams/flowchart.md#grammar).

A flowchart node, one of the boxes of the diagram, is called a **vertex** here,
as in the Db of mermaid.js, so that it is not confused with a node of the tree.
A **link** is one arrow with what belongs to it; a link between two vertex
groups makes a Db edge for each pair of their vertices.

The child fields of every node below are in source order, except those of a
[FlowchartLink](#flowchartlink) with text between two arrows (see
[Nodes](../ast.md#nodes)).

## Nodes

### FlowchartDiagram

| Field       | Type                       | Meaning                                                                                                          |
| ----------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `direction` | string or null             | The direction of the header as written, such as `LR`, `TD`, or `<`, without whitespace; null when there is none. |
| `body`      | list of FlowchartStatement | The statements, in source order.                                                                                 |

Child fields: `body`. The header keyword is not a field: the diagram types tell
`flowchart-elk` and `swimlane-beta` apart, and `graph` and `flowchart` make the
same Db. Its token is in `Root.tokens`.

The tokens of a FlowchartDiagram are all the tokens of the diagram text other
than `Directive` tokens, from the header keyword to the last of them. Its range
therefore also covers the tokens that belong to no statement, such as the
separator after the last statement and an ignored `;` that is a token of its
own: the range of the diagram of `A;` ends after the `;`. [fixture:
flowchart/tokens-diagram-trailing-separator]

**FlowchartStatement** is a FlowchartEmptyStatement, FlowchartVertexStatement,
FlowchartSubgraphStatement, FlowchartStyleStatement, FlowchartClassDefStatement,
FlowchartClassStatement, FlowchartClickCallbackStatement,
FlowchartClickUrlStatement, FlowchartLinkStyleStatement,
FlowchartDefaultLinkStyleStatement, FlowchartDirectionStatement,
FlowchartAccTitleStatement, FlowchartAccDescrStatement, or
FlowchartAccDescrBlockStatement.

### FlowchartEmptyStatement

A `;` that the grammar reads as a statement of its own, not as the separator of
the statement before it (see
[diagrams/flowchart.md](../diagrams/flowchart.md#diagram-and-statements)). It
has no fields and no child fields. Its range is that of its `;`.

### FlowchartVertexStatement

A chain of vertex groups joined by links, such as `A`, `A & B --> C`, or
`A --> B --> C`.

| Field   | Type                  | Meaning                                                 |
| ------- | --------------------- | ------------------------------------------------------- |
| `first` | FlowchartVertexGroup  | The first vertex group.                                 |
| `links` | list of FlowchartLink | The links, in source order; each leads to its `target`. |

Child fields: `first`, `links`. The source of each link is the `target` of the
link before it, or `first` for the first link.

### FlowchartVertexGroup

Vertices joined by `&`. A single vertex is a group of one.

| Field      | Type                    | Meaning                       |
| ---------- | ----------------------- | ----------------------------- |
| `vertices` | list of FlowchartVertex | One or more, in source order. |

Child fields: `vertices`.

### FlowchartVertex

One occurrence of a vertex.

| Field       | Type                       | Meaning                                                                                                       |
| ----------- | -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `id`        | Identifier                 | The id, commas included.                                                                                      |
| `shape`     | FlowchartShape or null     | The shape with its label; null when the vertex is written without one.                                        |
| `className` | Identifier or null         | The class after `:::`, commas included; null when there is none.                                              |
| `data`      | list of FlowchartDataBlock | The data blocks written right after the vertex, one after another, in source order; empty when there is none. |

Child fields: `id`, `shape`, `className`, `data`. The range of a vertex covers
its data blocks: it runs from its id to its last data block, when there is one,
and so do the ranges of the vertex group and the vertex statement that contain
it. [fixture: flowchart/gram-vertex-id-comma] [fixture:
flowchart/gram-vertex-class-comma]

### FlowchartShape

| Field      | Type                           | Meaning                                                                                                        |
| ---------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `name`     | string                         | One of the names in the table of [Shapes](../diagrams/flowchart.md#shapes), such as `rectangle` or `cylinder`. |
| `property` | FlowchartShapeProperty or null | The property of a rectangle written with `[\|`; null for every other shape.                                    |
| `label`    | FlowchartLabel                 | The label inside the shape.                                                                                    |

Child fields: `property`, `label`, in source order: the property comes before
the label. `property` is not null exactly when the shape is written as
`[|name:value|…]`; its name is `rectangle`, as that of `[…]` is (see
[Shapes](../diagrams/flowchart.md#shapes)).

### FlowchartShapeProperty

| Field   | Type       | Meaning                                 |
| ------- | ---------- | --------------------------------------- |
| `name`  | Identifier | The name before `:`, such as `borders`. |
| `value` | Identifier | The value after `:`, such as `lt`.      |

Child fields: `name`, `value`. Its range runs from the name to the value; the
`|` around them are not part of it.

### FlowchartLink

| Field     | Type                          | Meaning                                                                         |
| --------- | ----------------------------- | ------------------------------------------------------------------------------- |
| `id`      | Identifier or null            | The edge id written before the arrow, without its `@`; null when there is none. |
| `opening` | FlowchartOpeningArrow or null | The opening arrow of a link with text between two arrows; null otherwise.       |
| `arrow`   | FlowchartArrow                | The arrow, or the closing arrow of a link with text between two arrows.         |
| `label`   | FlowchartLabel or null        | The text between the arrows or between `\|`; null when there is none.           |
| `target`  | FlowchartVertexGroup          | The vertex group the link leads to.                                             |

Child fields: `id`, `opening`, `arrow`, `label`, `target`. The range runs from
the first token of the link to the last token of its target. The `label` comes
after the `arrow` when it is written between `|`, and before it when it is
written between the opening and the closing arrow; in the second way, the order
of the child fields is not the source order, which is `opening`, `label`,
`arrow` (see [Nodes](../ast.md#nodes)). The label stays one field, so that a
tool finds the label of a link in one place, whichever way it is written.
[fixture: flowchart/gram-pipe-label-space-after] [fixture:
flowchart/gram-link-text-string-then-text]

### FlowchartArrow

A closed arrow (see [Arrows](../diagrams/flowchart.md#arrows)): the arrow of a
link, or the closing arrow of a link with text between two arrows.

| Field         | Type    | Meaning                                                                                         |
| ------------- | ------- | ----------------------------------------------------------------------------------------------- |
| `value`       | string  | The text of its range.                                                                          |
| `startMarker` | string  | The marker before the line: `arrow` for `<`, `cross` for `x`, `circle` for `o`, or `none`.      |
| `line`        | string  | `solid` for `-`, `thick` for `=`, `dotted` for `.`, or `invisible` for `~`.                     |
| `length`      | integer | The number of the characters of the line: its `-`, `=`, or `~`, or, for a dotted line, its `.`. |
| `endMarker`   | string  | The marker after the line: `arrow` for `>`, `cross` for `x`, `circle` for `o`, or `none`.       |

No child fields. Its range is its token, the arrow without the whitespace that
its unit holds around it. `-->` has the line `solid`, the length 2, and the end
marker `arrow`; `<-->` has the start marker `arrow` too; `---` has the length 3
and no marker; in `A x==>B` the arrow `x==>` has the start marker `cross` and
the line `thick`; and `-..->` has the line `dotted` and the length 2. The `-`
around the `.` of a dotted line are not counted, and the first of them is
optional (`.->` and `-.->` are both dotted arrows of length 1); which of the two
is written is in `value` and in the token, not in a field. [fixture:
flowchart/db-arrow-single-forms] [fixture: flowchart/lex-arrow-head-x-before-id]
`value` is the text of its range, like every value: in `A[style:#x] -;-> B`, the
line rule ignores the `;`, so `value` is `-->`, with the same fields, while the
token is `-;->`. [fixture: flowchart/tokens-arrow-ignored-semicolon]

### FlowchartOpeningArrow

The opening arrow of a link with text between two arrows (see
[Arrows](../diagrams/flowchart.md#arrows)).

| Field         | Type   | Meaning                                                                                    |
| ------------- | ------ | ------------------------------------------------------------------------------------------ |
| `value`       | string | The text of its range.                                                                     |
| `startMarker` | string | The marker before the line: `arrow` for `<`, `cross` for `x`, `circle` for `o`, or `none`. |
| `line`        | string | `solid` for `--`, `thick` for `==`, or `dotted` for `-.`.                                  |

No child fields. Its range is its token. An opening arrow is one of `--`, `==`,
and `-.` after an optional marker, so it has no marker at its end and no length
of its own. Its `line` is always the `line` of the link's closing arrow, because
only a closed arrow of the same kind leaves the link text context (see
[The link text contexts](../diagrams/flowchart.md#the-link-text-contexts)). In
`A<-- t -->B`, the opening arrow has the start marker `arrow`, and in
`A== t x==>B`, both arrows have the line `thick` and the closing arrow has the
start marker `cross`. [fixture: flowchart/db-arrow-double] [fixture:
flowchart/db-arrow-thick-head-invalid] [fixture:
flowchart/db-arrow-dash-head-length]

### FlowchartLabel

| Field   | Type   | Meaning                                                                                                                                                                                                                                |
| ------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`  | string | `text`, `string`, or `markdown` (see [flowchart.md](../diagrams/flowchart.md#labels)).                                                                                                                                                 |
| `value` | string | The content of the string or markdown string that it starts with, followed by the text of the rest of its range; for a label that starts with a text run, the text of its range (see [flowchart.md](../diagrams/flowchart.md#labels)). |

No child fields. A label that is all whitespace has no token; like every node
without a token, its range covers its units (see [ast.md](../ast.md#nodes)), so
its value is that whitespace.

### FlowchartLiteral

A value that the author writes as a text without quotes at a position where the
grammar allows whitespace in it and decides where it ends: a style, the
arguments of a callback, or the text of an accessibility statement. The position
decides, not what is written there: `accTitle: x` and the style `fill:red` are
literals although each is one word, because their positions allow a text with
whitespace, while the value of the property of a rectangle written with `[|` is
an [Identifier](../ast.md#identifier), because its position allows only one word
(see [Shared leaf nodes](../ast.md#shared-leaf-nodes)).

| Field   | Type   | Meaning                                                |
| ------- | ------ | ------------------------------------------------------ |
| `value` | string | The text of its range (see [ast.md](../ast.md#nodes)). |

No child fields. Its tokens are `RawText` tokens: one, or more when directives
between its units cut the text (see
[common.md](../common.md#a-directive-is-a-token-boundary)). The value keeps the
whitespace inside it, line feeds included, and has none at its ends; the
whitespace written around a literal belongs to no node, and where the Db needs
it, it reads it from the source (see
[flowchart.md](../diagrams/flowchart.md#building-the-summary-from-the-tree)). A
literal always has a token: where the text is all whitespace, as a style can be,
the field holds null instead (see
[FlowchartStyleStatement](#flowchartstylestatement)).

### FlowchartDataBlock

One data block, from `@{` to the `}` that closes it. Blocks written one after
another, as in `A@{ shape: rect }@{ label: x }`, are a node each.

| Field   | Type   | Meaning                                                        |
| ------- | ------ | -------------------------------------------------------------- |
| `value` | string | The text of its range between `@{` and the `}` that closes it. |

No child fields. The tree does not read the value (see
[`embedded-data-opaque`](../known-divergences.md#embedded-data-opaque)). Unlike
the frontmatter, the block has no separate range for its value: the value lies
in the block's tokens. [fixture: flowchart/gram-data-consecutive-blocks]

### FlowchartIgnoredText

Text that the author writes but that mermaid.js does not read, and that has no
effect on the diagram. It is a node of its own type so that a tool can find such
text without searching the tokens. In flowchart, it is the text of a direction
line before `direction` and after the value (see
[FlowchartDirectionStatement](#flowchartdirectionstatement)).

| Field   | Type   | Meaning                                                |
| ------- | ------ | ------------------------------------------------------ |
| `value` | string | The text of its range (see [ast.md](../ast.md#nodes)). |

No child fields. Its tokens are `RawText` tokens: one, or more when directives
cut the text, as in `A-%%{init: {}}%%->B direction LR`, whose text before
`direction` is `A-->B`. Its range runs from its first token to its last, so its
value has no whitespace at its ends. [fixture:
flowchart/lex-direction-line-text-before-directive-inside] [fixture:
flowchart/lex-direction-line-text-after-directive-inside]

### FlowchartSubgraphStatement

| Field   | Type                       | Meaning                                                 |
| ------- | -------------------------- | ------------------------------------------------------- |
| `name`  | FlowchartLabel             | The name written after `subgraph`.                      |
| `title` | FlowchartLabel or null     | The title between `[` and `]`; null when there is none. |
| `body`  | list of FlowchartStatement | The statements up to `end`, in source order.            |

Child fields: `name`, `title`, `body`. The name is a label, not an Identifier:
the grammar allows it to be a text with whitespace, a string, a markdown string,
or one of these strings followed by text, and which of them is written gives the
label type of the subgraph; a name with whitespace is not its id. The Db id and
title of the subgraph are derived from `name`, `title`, and the source text that
no node holds between the name and its title or separator (see
[flowchart.md](../diagrams/flowchart.md#db-normalization)).

### FlowchartStyleStatement

| Field    | Type                               | Meaning                                                                                  |
| -------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| `id`     | Identifier                         | The id, commas included.                                                                 |
| `styles` | list of (FlowchartLiteral or null) | The styles, in source order: each a literal, or null for a style that is all whitespace. |

Child fields: `id`, `styles`. A style is the text between two `,` or at either
end of the list, such as `fill:#f00`, and its literal holds it without the
whitespace at its ends: in `style A fill:#f00 , stroke:#333 `, the styles are
`fill:#f00` and `stroke:#333`. The whitespace written around a style is read by
the Db (see
[flowchart.md](../diagrams/flowchart.md#building-the-summary-from-the-tree)). A
style that is all whitespace has no token, so it is null: the styles of
`style A fill:#f00, ` are a literal and null. [fixture:
flowchart/gram-style-id-comma] [fixture: flowchart/gram-style-whitespace]
[fixture: flowchart/db-style-whitespace-only-value]

### FlowchartClassDefStatement

| Field        | Type                               | Meaning                                                                                                                                                                                                                    |
| ------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `classNames` | list of (Identifier or null)       | The class names: the parts of the `id-list` after `classDef` between its `,` units, in source order; null for a part that is empty (see [flowchart.md](../diagrams/flowchart.md#style-class-and-link-style-statements)).   |
| `styles`     | list of (FlowchartLiteral or null) | The styles, as in FlowchartStyleStatement, except that a `,` right after a `\` does not separate two styles but is part of the style (see [flowchart.md](../diagrams/flowchart.md#style-class-and-link-style-statements)). |

Child fields: `classNames`, `styles`. [fixture:
flowchart/db-classdef-names-empty] [fixture:
flowchart/db-classdef-names-trailing-comma]

### FlowchartClassStatement

| Field       | Type                         | Meaning                                                                                                                 |
| ----------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `ids`       | list of (Identifier or null) | The first id after `class`, as a list: the parts of its `id-list` between its `,` units; null for a part that is empty. |
| `className` | Identifier                   | The second id, commas included.                                                                                         |

Child fields: `ids`, `className`. [fixture: flowchart/db-class-ids-empty-first]
[fixture: flowchart/db-class-ids-only-comma] [fixture:
flowchart/gram-class-name-comma]

### FlowchartClickCallbackStatement

A click statement that calls a function: `click A callback`,
`click A call callback(arguments)`.

| Field       | Type                         | Meaning                                                                                                                                                                                                                         |
| ----------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ids`       | list of (Identifier or null) | The click ids: the parts between the `click-comma` units, in source order; null for a part that is empty.                                                                                                                       |
| `callback`  | Identifier                   | The name of the function: the characters up to `(`, which may contain whitespace and line breaks; the whitespace at its ends is not part of the name (see [Click and callbacks](../diagrams/flowchart.md#click-and-callbacks)). |
| `arguments` | FlowchartLiteral or null     | The arguments between the parentheses after a `call`, whose value keeps its whitespace and line feeds; null when there are none, or when only whitespace is between the parentheses. The tree does not read them.               |
| `tooltip`   | StringLiteral or null        | The tooltip string; null when there is none.                                                                                                                                                                                    |

Child fields: `ids`, `callback`, `arguments`, `tooltip`. [fixture:
flowchart/tokens-callback-name-trailing-space]

### FlowchartClickUrlStatement

A click statement that links to a URL: `click A href "url"`,
`click A "url" "tooltip" _blank`.

| Field     | Type                         | Meaning                                                                                                                                                                  |
| --------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ids`     | list of (Identifier or null) | As in FlowchartClickCallbackStatement.                                                                                                                                   |
| `url`     | StringLiteral                | The URL string.                                                                                                                                                          |
| `tooltip` | StringLiteral or null        | As in FlowchartClickCallbackStatement.                                                                                                                                   |
| `target`  | string or null               | The link target, one of `_self`, `_blank`, `_parent`, and `_top` (see [The statement context](../diagrams/flowchart.md#the-statement-context)); null when there is none. |

Child fields: `ids`, `url`, `tooltip`. [fixture:
flowchart/db-click-ids-empty-tooltip] [fixture: flowchart/lex-click-id-comma]

The range of a click statement of either type starts at the `click` unit that
entered the click context in which its click ids were read, the unit with which
the grammar of the statement starts. That `click` is a `Keyword` token in the
range, and it belongs to no field. A statement has no other `click` unit (see
[Click and callbacks](../diagrams/flowchart.md#click-and-callbacks)). [fixture:
flowchart/gram-click-href]

### FlowchartLinkStyleStatement

A `linkStyle` statement for numbered links.

| Field         | Type                               | Meaning                                                               |
| ------------- | ---------------------------------- | --------------------------------------------------------------------- |
| `indices`     | list of NumericLiteral             | The numbers, in source order, each an integer.                        |
| `interpolate` | Identifier or null                 | The name after `interpolate`; null when there is none.                |
| `styles`      | list of (FlowchartLiteral or null) | The styles, as in FlowchartStyleStatement; empty when there are none. |

Child fields: `indices`, `interpolate`, `styles`. `interpolate` is not null, or
`styles` is not empty, or both.

### FlowchartDefaultLinkStyleStatement

A `linkStyle default` statement, which sets the style of every link instead of
numbered ones.

| Field         | Type                               | Meaning                            |
| ------------- | ---------------------------------- | ---------------------------------- |
| `interpolate` | Identifier or null                 | As in FlowchartLinkStyleStatement. |
| `styles`      | list of (FlowchartLiteral or null) | As in FlowchartLinkStyleStatement. |

Child fields: `interpolate`, `styles`. `interpolate` is not null, or `styles` is
not empty, or both.

### FlowchartDirectionStatement

| Field        | Type                                                  | Meaning                                                                                                             |
| ------------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `textBefore` | [FlowchartIgnoredText](#flowchartignoredtext) or null | The text of the direction line before `direction`, or null when there is none (when it is empty or all whitespace). |
| `direction`  | string                                                | `TB`, `BT`, `RL`, `LR`, or `TD`.                                                                                    |
| `textAfter`  | [FlowchartIgnoredText](#flowchartignoredtext) or null | The text of the direction line after the value, or null when there is none.                                         |

Child fields: `textBefore`, `textAfter`. The range covers the whole direction
line, and so the ranges of both texts. `A-->B direction TB` has the text `A-->B`
before `direction`, and `  accDescr: d ; direction LR` the text `accDescr: d ;`;
`A[direction TB]` has the text `A[` before it and `]` after the value, and
`direction LR trailing` the text `trailing` after it. [fixture:
flowchart/lex-direction-line-swallows-edge] [fixture:
flowchart/lex-direction-line-acc-descr-subgraph-indented] [fixture:
flowchart/lex-direction-line-text-before-directive-inside] [fixture:
flowchart/lex-direction-line-in-label] [fixture:
flowchart/lex-direction-line-text-after-value] [fixture:
flowchart/lex-direction-line-text-after-directive-inside] `direction`, a line
break, and `TB` has neither. [fixture:
flowchart/lex-direction-line-top-level-next-line]

### FlowchartAccTitleStatement

| Field   | Type                     | Meaning                                                                         |
| ------- | ------------------------ | ------------------------------------------------------------------------------- |
| `value` | FlowchartLiteral or null | The text after `accTitle:`, up to the end of the line; null when there is none. |

Child fields: `value`. The whitespace after `:` is read with it, line breaks
included, so the value is null only at the end of the text. [fixture:
flowchart/lex-acc-title-next-line] [fixture:
flowchart/gram-acc-title-empty-at-end]

### FlowchartAccDescrStatement

An `accDescr:` statement with its text.

| Field   | Type                     | Meaning                                                                         |
| ------- | ------------------------ | ------------------------------------------------------------------------------- |
| `value` | FlowchartLiteral or null | The text after `accDescr:`, up to the end of the line; null when there is none. |

Child fields: `value`. The whitespace after `:` is read with it, line breaks
included, so the value is null only at the end of the text. [fixture:
flowchart/db-acc-descr-empty-replaces]

### FlowchartAccDescrBlockStatement

An `accDescr {` statement with its text and its `}`, which it lacks when the
text ends inside it. It is a node type of its own because it has a different
effect on the Db than an `accDescr:` statement: a block that is not closed sets
the empty description, whatever its text, and a closed block without text
changes nothing (see
[flowchart.md](../diagrams/flowchart.md#building-the-summary-from-the-tree)).

| Field    | Type                     | Meaning                                                                                                                 |
| -------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `value`  | FlowchartLiteral or null | The text between `accDescr {` and `}`, or to the end of the text when the block is not closed; null when there is none. |
| `closed` | boolean                  | Whether the block ends with `}`. It is false when the text ends inside the block.                                       |

Child fields: `value`. The value of `accDescr { x` at the end of the text is
`x`. [fixture: flowchart/lex-acc-descr-block-unclosed] `accDescr {  }` is a
closed block without text, whose value is null: the whitespace after `{` is read
with the `{`. Such a block starts a statement as every description block does,
so `A accDescr {}` is rejected (see
[flowchart.md](../diagrams/flowchart.md#accessibility-values)). [fixture:
flowchart/gram-acc-descr-block-empty] [fixture:
flowchart/db-acc-descr-empty-block-keeps] [fixture:
flowchart/gram-empty-description-block-after-vertex]

## Tokens

The tokens are made from the units of
[diagrams/flowchart.md](../diagrams/flowchart.md#lexical-structure). Every unit
that is not all whitespace belongs to one **item** of
[the grammar](../diagrams/flowchart.md#grammar) and has the kind that this table
gives for the item:

| Kind         | Items and their units                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | a `header-keyword` or `header-direction` unit; a `subgraph`, `end`, `style`, `classDef`, `class`, `linkStyle`, `interpolate`, `href`, `accTitle`, or `accDescr` unit that begins or continues a statement; the `click` unit of a click statement; a `call` unit of a click statement; a `default` unit of a `linkStyle` statement; the `direction` and `direction-value` units of a direction statement; a `link-target` unit                                                                                                                                                                                   |
| `Identifier` | an `id`, with all its units; an `id-list-part`, with all its units; an `edge-id` unit; a `click-id` unit of a click statement; the `callback-name` unit of a click statement; a `name`, with all its units; the two `id-run` units of a rectangle written with `[\|`, each an item of its own                                                                                                                                                                                                                                                                                                                   |
| `Numeric`    | a `number` unit of a `linkStyle` statement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `String`     | a `string` or `markdown-string` unit                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `RawText`    | the `text-run` units of a label; the `link-text-char` units of a link; the units of a `subgraph-name` other than its strings and markdown strings, each run of them that no string separates one item: the units of its name pieces; a style of the tree, with all its units, including a `,` right after a `\` in a `classDef` statement; the `title-text`, `description-text`, or `description-block-text` unit of a statement; the `callback-arguments` unit of a click statement; the `data-text` and `data-quote` units between a `data-start` unit and its `}`; a `direction-text` unit                   |
| `Punctuator` | the units that open a shape, together one item: the units before the label in an alternative of the rule `shape`, except in its last alternative, where it is `"[\|"` alone; the units after the label in an alternative of the rule `shape`, together one item; every other unit that is not all whitespace, each an item of its own: the `\|` around the label of a link, the `:` and the `\|` of a rectangle written with `[\|`, `&`, `:::`, `,` other than the one just named, a `click-comma` unit of a click statement, `:`, `;`, `@`, `data-start` and `}`, arrows and opening arrows, `{`, `(`, and `)` |

A **token** is a maximal run of units of one item and one kind that follow one
another with nothing between them but whitespace units of that item, without the
whitespace at its ends. Where a directive lies between two characters of such a
run that are not whitespace, the run is cut at the directive: each piece,
without the whitespace at its ends, is a token, and a piece that is all
whitespace is no token (see
[common.md](../common.md#a-directive-is-a-token-boundary)); the directive
between the pieces is a `Directive` token of its own (see
[ast.md](../ast.md#directive)). A directive inside one unit makes the input
rejected unless the unit is `RawText` or `Identifier`. Each unit belongs to one
item and has one kind, so this rule decides every token, and every character
that is not whitespace is in a token or a comment.

- In an `id-list`, each part between two `,` units is an `Identifier` token of
  its own, and each `,` is a `Punctuator`, and so it is with the `click-comma`
  units in the click ids of a click statement: `classDef a,,b fill:red` has the
  tokens `classDef`, `a`, `,`, `,`, `b`, and `fill:red`. [fixture:
  flowchart/db-classdef-names-empty]
- An id is one token even when it consists of several units: `12ab` and `A-b`
  are one `Identifier` each, and so is `日本語`, although each of its characters
  is a `letter` unit. A style such as `stroke-width: 2px` is one `RawText`
  token, and so is a subgraph name such as `a b`.
- A string is one unit, from its opening quote to its closing quote, and so one
  `String` token.
- In a click statement, the `call` tokens and the `(` and `)` tokens around the
  arguments belong to the statement and to no field. [fixture:
  flowchart/gram-click-call] [fixture:
  flowchart/gram-click-empty-call-then-arguments]
- The delimiters that open a shape are one token, and so are those that close
  it, also where they are two units: `((` and `))` of a circle and `{{` and `}}`
  of a hexagon are one `Punctuator` token each, like `(((` and `[[`. A directive
  between the two units cuts such a token: `A(%%{init: {}}%%(x))` is a circle,
  as in mermaid.js, whose opening delimiters are the two tokens `(` and `(`.
  [fixture: flowchart/tokens-circle-hexagon-delimiters] [fixture:
  flowchart/tokens-circle-directive-between] [fixture:
  flowchart/gram-circle-gap]
- A `;` that the line rule ignores follows the rule of
  [ast.md](../ast.md#tokens): it is inside a token when characters of that token
  lie on both sides of it, and otherwise a `Punctuator` token of its own.
  `A[x;]` has the label `x;`, and the `;` is inside the label's token. In
  `A[mystyle:#x;]` the `;` is ignored, so the label's token is `mystyle:#x`, and
  the `;` after it is a `Punctuator` of its own. [fixture:
  flowchart/tokens-label-semicolon] [fixture: common/entity-style-in-label]
- The separator `;` of a statement is not in the range of the statement: a
  statement's range runs from its first to its last token.
- A label that is all whitespace, such as the label of `A[ ]`, `A-->| |B`, or
  `subgraph S[ ]`, has no token; it is the only node that can have none, and its
  range covers its units (see [ast.md](../ast.md#nodes)). A style that is all
  whitespace has no token either, and it is null in the tree (see
  [FlowchartStyleStatement](#flowchartstylestatement)). [fixture:
  flowchart/gram-label-space] [fixture: flowchart/tokens-pipe-label-space]
  [fixture: flowchart/tokens-subgraph-title-space] [fixture:
  flowchart/db-style-whitespace-only-value]
