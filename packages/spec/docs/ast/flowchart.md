# Flowchart nodes

Japanese version: [flowchart.ja.md](./flowchart.ja.md)

This document defines the nodes of the tree for the diagram types
`flowchart-v2`, `flowchart-elk`, and `swimlane`. The shared parts of the tree
are defined in [ast.md](../ast.md); how the source is read, and which grammar
rule makes which node, is defined in
[diagrams/flowchart.md](../diagrams/flowchart.md).

The body of these diagram types is a [FlowchartDiagram](#flowchartdiagram). The
values of the fields keep what the author wrote, as [ast.md](../ast.md#nodes)
defines the written text of a value; they are not in the converted form of
[common.md](../common.md#reading-a-source). A value starts or ends with
whitespace only where its units hold it as their own characters (see
[Nodes](../ast.md#nodes)): in this diagram type, at the start of a style after a
`,`, after the name of a subgraph without a title, and at the end of the name of
a callback after `call` and at the ends of its arguments (see
[FlowchartStyleStatement](#flowchartstylestatement),
[FlowchartSubgraphStatement](#flowchartsubgraphstatement), and
[FlowchartClickCallbackStatement](#flowchartclickcallbackstatement)). Elsewhere,
the whitespace at the ends of a value is outside it. mermaid.js also reads into
the name of a subgraph the whitespace between or after the empty description
blocks right after the name, which no node holds (see
[FlowchartSubgraphStatement](#flowchartsubgraphstatement)). The names and values
that the author writes are the leaf nodes of
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

A StringLiteral of this diagram type, the URL or the tooltip of a click
statement, is always closed and never empty: an empty string `""` is an
`empty-string` unit, which no rule of the grammar takes (see
[Strings](../diagrams/flowchart.md#strings)). [fixture:
flowchart/lex-empty-string-line] [fixture:
flowchart/gram-click-href-empty-string] [fixture:
flowchart/gram-click-href-tooltip-empty-string] [fixture:
flowchart/gram-click-call-tooltip-empty-string] [fixture:
flowchart/gram-click-callback-tooltip-empty-string]

## Nodes

### FlowchartDiagram

| Field       | Type                       | Meaning                                                                                                          |
| ----------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `direction` | string or null             | The direction of the header as written, such as `LR`, `TD`, or `<`, without whitespace; null when there is none. |
| `body`      | list of FlowchartStatement | The statements, in source order.                                                                                 |

Child fields: `body`. The header keyword is not a field: the diagram types tell
`flowchart-elk` and `swimlane-beta` apart, and `graph` and `flowchart` make the
same Db.

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
has no fields and no child fields.

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

| Field      | Type                       | Meaning                                                                                                       |
| ---------- | -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `id`       | Identifier                 | The id, commas included.                                                                                      |
| `shape`    | FlowchartShape or null     | The shape with its label; null when the vertex is written without one.                                        |
| `cssClass` | Identifier or null         | The CSS class after `:::`, commas included; null when there is none.                                          |
| `data`     | list of FlowchartDataBlock | The data blocks written right after the vertex, one after another, in source order; empty when there is none. |

Child fields: `id`, `shape`, `cssClass`, `data`. [fixture:
flowchart/gram-vertex-id-comma] [fixture: flowchart/gram-vertex-class-comma]

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

Child fields: `name`, `value`.

### FlowchartLink

| Field     | Type                          | Meaning                                                                         |
| --------- | ----------------------------- | ------------------------------------------------------------------------------- |
| `id`      | Identifier or null            | The edge id written before the arrow, without its `@`; null when there is none. |
| `opening` | FlowchartOpeningArrow or null | The opening arrow of a link with text between two arrows; null otherwise.       |
| `arrow`   | FlowchartArrow                | The arrow, or the closing arrow of a link with text between two arrows.         |
| `label`   | FlowchartLabel or null        | The text between the arrows or between `\|`; null when there is none.           |
| `target`  | FlowchartVertexGroup          | The vertex group the link leads to.                                             |

Child fields: `id`, `opening`, `arrow`, `label`, `target`. The `label` comes
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
| `value`       | string  | Its written text.                                                                               |
| `startMarker` | string  | The marker before the line: `arrow` for `<`, `cross` for `x`, `circle` for `o`, or `none`.      |
| `line`        | string  | `solid` for `-`, `thick` for `=`, `dotted` for `.`, or `invisible` for `~`.                     |
| `length`      | integer | The number of the characters of the line: its `-`, `=`, or `~`, or, for a dotted line, its `.`. |
| `endMarker`   | string  | The marker after the line: `arrow` for `>`, `cross` for `x`, `circle` for `o`, or `none`.       |

No child fields. `-->` has the line `solid`, the length 2, and the end marker
`arrow`; `<-->` has the start marker `arrow` too; `---` has the length 3 and no
marker; in `A x==>B` the arrow `x==>` has the start marker `cross` and the line
`thick`; and `-..->` has the line `dotted` and the length 2. The `-` around the
`.` of a dotted line are not counted, and the first of them is optional (`.->`
and `-.->` are both dotted arrows of length 1); which of the two is written is
in `value`, not in a field. [fixture: flowchart/db-arrow-single-forms] [fixture:
flowchart/lex-arrow-head-x-before-id]

### FlowchartOpeningArrow

The opening arrow of a link with text between two arrows (see
[Arrows](../diagrams/flowchart.md#arrows)).

| Field         | Type   | Meaning                                                                                    |
| ------------- | ------ | ------------------------------------------------------------------------------------------ |
| `value`       | string | Its written text.                                                                          |
| `startMarker` | string | The marker before the line: `arrow` for `<`, `cross` for `x`, `circle` for `o`, or `none`. |
| `line`        | string | `solid` for `--`, `thick` for `==`, or `dotted` for `-.`.                                  |

No child fields. An opening arrow is one of `--`, `==`, and `-.` after an
optional marker, so it has no marker at its end and no length of its own. Its
`line` is always the `line` of the link's closing arrow, because only a closed
arrow of the same kind leaves the link text context (see
[The link text contexts](../diagrams/flowchart.md#the-link-text-contexts)). In
`A<-- t -->B`, the opening arrow has the start marker `arrow`, and in
`A== t x==>B`, both arrows have the line `thick` and the closing arrow has the
start marker `cross`. [fixture: flowchart/db-arrow-double] [fixture:
flowchart/db-arrow-thick-head-invalid] [fixture:
flowchart/db-arrow-dash-head-length]

### FlowchartLabel

| Field   | Type   | Meaning                                                                                                                                                                                                                                   |
| ------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`  | string | `text`, `string`, or `markdown` (see [flowchart.md](../diagrams/flowchart.md#labels)).                                                                                                                                                    |
| `value` | string | The content of the string or markdown string that it starts with, followed by the written text of the rest of the label; for a label that starts with a text run, its written text (see [flowchart.md](../diagrams/flowchart.md#labels)). |

No child fields. The value of a label that is all whitespace is that whitespace.
[fixture: flowchart/tokens-label-all-whitespace] [fixture:
flowchart/tokens-edge-label-all-whitespace] [fixture:
flowchart/tokens-subgraph-title-all-whitespace]

### FlowchartLiteral

A value that the author writes as a text without quotes at a position where the
grammar allows whitespace in it and decides where it ends: a style, the name of
a callback after `call` and its arguments, or the text of an accessibility
statement. The position decides, not what is written there: `accTitle: x` and
the style `fill:red` are literals although each is one word, because their
positions allow a text with whitespace, while the value of the property of a
rectangle written with `[|` is an [Identifier](../ast.md#identifier), because
its position allows only one word (see
[Shared leaf nodes](../ast.md#shared-leaf-nodes)).

| Field   | Type   | Meaning                                           |
| ------- | ------ | ------------------------------------------------- |
| `value` | string | Its written text (see [ast.md](../ast.md#nodes)). |

No child fields. The value keeps the whitespace inside it, line feeds included;
at its ends, it has whitespace only where mermaid.js reads it, at the start of a
style after a `,`, at the end of the name of a callback after `call`, and at the
ends of its arguments, and the whitespace written around a literal elsewhere
belongs to no node. Where the text is all whitespace, as a style can be, the
field holds null instead of a literal (see
[FlowchartStyleStatement](#flowchartstylestatement)).

### FlowchartDataBlock

One data block, from `@{` to the `}` that closes it. Blocks written one after
another, as in `A@{ shape: rect }@{ label: x }`, are a node each.

| Field   | Type   | Meaning                                                   |
| ------- | ------ | --------------------------------------------------------- |
| `value` | string | Its written text between `@{` and the `}` that closes it. |

No child fields. The tree does not read the value (see
[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md)).
[fixture: flowchart/gram-data-consecutive-blocks]

### FlowchartIgnoredText

Text that the author writes but that mermaid.js does not read, and that has no
effect on the diagram. It is a node of its own type so that a tool can find such
text without searching the source text. In flowchart, it is the text of a
direction line before `direction` and after the value (see
[FlowchartDirectionStatement](#flowchartdirectionstatement)).

| Field   | Type   | Meaning                                           |
| ------- | ------ | ------------------------------------------------- |
| `value` | string | Its written text (see [ast.md](../ast.md#nodes)). |

No child fields. Its value has no whitespace at its ends. [fixture:
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
or one of these strings followed by text, and the `kind` of the label records
which of them is written; a name with whitespace is not its id. The Db id and
title of the subgraph are derived from `name`, `title`, and the source text that
no node holds between the name and its title or separator (see
[flowchart.md](../diagrams/flowchart.md#rejections-outside-the-grammar)):
without a title, mermaid.js reads the name with the whitespace after it, up to
the separator, and a subgraph without a title whose name holds whitespace gets a
generated id. So, without a title, the written text of the name runs over the
whitespace after it, up to the separator or the first empty description block
after it, and its value holds that whitespace: `subgraph S` followed by a space
has the name `S` and a space, and so has `subgraph S accDescr {}`; after a
string, the whitespace is part of the name too, as in `subgraph "S"` followed by
a space. [fixture: flowchart/db-subgraph-name-trailing-space] [fixture:
flowchart/db-subgraph-name-space-before-empty-description-block] [fixture:
flowchart/db-subgraph-string-name-trailing-space] With a title, mermaid.js reads
no whitespace before the `[`, and the name ends at its last character that is
not whitespace: `subgraph a  [T]` has the id `a`. [fixture:
flowchart/db-subgraph-title-spaces-before-bracket] Only where empty description
blocks follow the name right after it, the whitespace between them, or between
the last of them and a `;`, belongs to no node, since the blocks are statements
of `body`, while mermaid.js reads it into the name:
`subgraph "S"accDescr {} accDescr {}` and `subgraph "S"accDescr {} ;` get a
generated id. In these forms only, the Db reads that whitespace from the source.
[fixture: flowchart/db-subgraph-name-space-between-empty-description-blocks]
[fixture:
flowchart/db-subgraph-name-space-after-empty-description-block-before-semicolon]
The empty description blocks after the name or the title, before the separator,
are the first statements of `body`, so that the child nodes stay in source
order: `subgraph S accDescr {}`, a line `A`, and `end` has the body of a
FlowchartAccDescrBlockStatement and a FlowchartVertexStatement. [fixture:
flowchart/gram-empty-description-block-after-subgraph-name]

### FlowchartStyleStatement

| Field    | Type                               | Meaning                                                                                  |
| -------- | ---------------------------------- | ---------------------------------------------------------------------------------------- |
| `id`     | Identifier                         | The id, commas included.                                                                 |
| `styles` | list of (FlowchartLiteral or null) | The styles, in source order: each a literal, or null for a style that is all whitespace. |

Child fields: `id`, `styles`. A style is the text between two `,` or at either
end of the list, such as `fill:#f00`. mermaid.js reads the whitespace at its
start after a `,`, tabs included, which decides, for example, whether a link
style starts with `fill`. So the literal of a style starts right after the `,`
before it, and the first style after the whitespace that the statement reads
before it, and ends at its last character that is not whitespace: in
`style A fill:#f00 ,  stroke:#333 `, the styles are `fill:#f00` and
`stroke:#333` after two spaces. [fixture: flowchart/db-style-tabs-after-comma]
[fixture: flowchart/db-linkstyle-leading-space-fill] A style that is all
whitespace is null, whatever the amount of whitespace, which mermaid.js reads as
the empty text: the styles of `style A fill:#f00, ` are a literal and null. As
the line rule ignores the `;`, `style A fill:#f00;` followed by two spaces has
the style `fill:#f00`, and `style A fill:#f00;stroke:#0f0` the one style
`fill:#f00stroke:#0f0`. `style A fill:#f00, %%{init: {}}%%` followed by two
spaces and `stroke:#333` has the second style of three spaces and `stroke:#333`.
[fixture: flowchart/tokens-style-ignored-semicolon-then-spaces] [fixture:
common/entity-style-semicolon-between-styles] [fixture:
flowchart/tokens-style-directive-after-comma] [fixture:
flowchart/gram-style-id-comma] [fixture: flowchart/gram-style-whitespace]
[fixture: flowchart/db-style-whitespace-only-value]

### FlowchartClassDefStatement

| Field        | Type                               | Meaning                                                                                                                                                                                                                    |
| ------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cssClasses` | list of (Identifier or null)       | The CSS classes: the parts of the `id-list` after `classDef` between its `,` units, in source order; null for a part that is empty (see [flowchart.md](../diagrams/flowchart.md#style-class-and-link-style-statements)).   |
| `styles`     | list of (FlowchartLiteral or null) | The styles, as in FlowchartStyleStatement, except that a `,` right after a `\` does not separate two styles but is part of the style (see [flowchart.md](../diagrams/flowchart.md#style-class-and-link-style-statements)). |

Child fields: `cssClasses`, `styles`. [fixture:
flowchart/db-classdef-names-empty] [fixture:
flowchart/db-classdef-names-trailing-comma]

### FlowchartClassStatement

| Field      | Type                         | Meaning                                                                                                                 |
| ---------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `ids`      | list of (Identifier or null) | The first id after `class`, as a list: the parts of its `id-list` between its `,` units; null for a part that is empty. |
| `cssClass` | Identifier                   | The second id, the CSS class, commas included.                                                                          |

Child fields: `ids`, `cssClass`. [fixture: flowchart/db-class-ids-empty-first]
[fixture: flowchart/db-class-ids-only-comma] [fixture:
flowchart/gram-class-name-comma]

### FlowchartClickCallbackStatement

A click statement that calls a function: `click A callback`,
`click A call callback(arguments)`.

| Field       | Type                           | Meaning                                                                                                                                                                                                                                                                                             |
| ----------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ids`       | list of (Identifier or null)   | The click ids: the parts between the `click-comma` units, in source order; null for a part that is empty.                                                                                                                                                                                           |
| `callback`  | Identifier or FlowchartLiteral | The name of the function: after `call`, a FlowchartLiteral, the `callback-name` unit, the characters up to `(`, whitespace and line breaks included (see [Click and callbacks](../diagrams/flowchart.md#click-and-callbacks)); without `call`, as in `click A callback`, an Identifier, a click id. |
| `arguments` | FlowchartLiteral or null       | The arguments between the parentheses after a `call`, as one text whose value keeps its whitespace and line feeds, at its ends too; null when there are none, or when only whitespace is between the parentheses. The tree does not read them.                                                      |
| `tooltip`   | StringLiteral or null          | The tooltip string; null when there is none.                                                                                                                                                                                                                                                        |

Child fields: `ids`, `callback`, `arguments`, `tooltip`. The name after `call`
keeps the whitespace before `(`, which mermaid.js passes on as part of the name
of the function: `click A call f (x)` calls the function named `f` and a space.
mermaid.js passes the arguments on as they are written, and then divides them at
each `,` outside quotes and trims each of them: `click A call f( x, y )` has the
arguments of a space, `x, y`, and a space, which call `f` with `x` and `y`.
[fixture: flowchart/tokens-callback-name-trailing-space] [fixture:
flowchart/tokens-callback-arguments-spaces-at-ends]

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

A statement has no other `click` unit (see
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

Child fields: `textBefore`, `textAfter`. `A-->B direction TB` has the text
`A-->B` before `direction`, and `  accDescr: d ; direction LR` the text
`accDescr: d ;`; `A[direction TB]` has the text `A[` before it and `]` after the
value, and `direction LR trailing` the text `trailing` after it. [fixture:
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
changes nothing.

| Field    | Type                     | Meaning                                                                                                                 |
| -------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `value`  | FlowchartLiteral or null | The text between `accDescr {` and `}`, or to the end of the text when the block is not closed; null when there is none. |
| `closed` | boolean                  | Whether the block ends with `}`. It is false when the text ends inside the block.                                       |

Child fields: `value`. The value of `accDescr { x` at the end of the text is
`x`. [fixture: flowchart/lex-acc-descr-block-unclosed] `accDescr {  }` is a
closed block without text, whose value is null: the whitespace after `{` is read
with the `{`. Such a block is a statement where a statement starts and also
after the last unit of a statement, before its separator: `A accDescr {}` is a
vertex statement and a FlowchartAccDescrBlockStatement, and after the name of a
subgraph it is the first statement of the subgraph's body; after the direction
of the header, before its separator, it is the first statement of the diagram's
`body` (see
[flowchart.md](../diagrams/flowchart.md#empty-description-blocks-before-a-separator)).
Elsewhere it lies inside a statement, and the input is rejected (see
[flowchart.md](../diagrams/flowchart.md#accessibility-values)). [fixture:
flowchart/gram-acc-descr-block-empty] [fixture:
flowchart/db-acc-descr-empty-block-keeps] [fixture:
flowchart/gram-empty-description-block-after-vertex] [fixture:
flowchart/header-empty-description-block-after-direction]
