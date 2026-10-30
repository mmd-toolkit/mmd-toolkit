# Block diagram nodes

Japanese version: [block.ja.md](./block.ja.md)

This document defines the nodes of the tree for the diagram type `block`. The
shared parts of the tree are defined in [ast.md](../ast.md); how the source is
read, and which grammar rule makes which node, is defined in
[diagrams/block.md](../diagrams/block.md).

The body of this diagram type is a [BlockDiagram](#blockdiagram). The values of
the fields keep what the author wrote, as [ast.md](../ast.md#nodes) defines the
written text of a value; they are not in the converted form of
[common.md](../common.md#reading-a-source). How mermaid.js reads the values into
its Db, such as the type of a shape, a block defined twice, and a chain of
edges, is in the summary of the tests package.

A block diagram places **blocks** in columns: nodes, `space` blocks, and
**composites**, which hold blocks of their own. Edges join nodes, and classes
and styles give them a look.

## Nodes

### BlockDiagram

| Field  | Type                   | Meaning                                        |
| ------ | ---------------------- | ---------------------------------------------- |
| `body` | list of BlockStatement | The statements, in source order; at least one. |

Child fields: `body`. The header keyword, `block-beta` or `block`, is not a
field: both give the same diagram type. A header with no statement is rejected.
[fixture: block/db-name-no-final-line-feed] [fixture:
block/header-only-block-beta]

**BlockStatement** is a BlockNodeStatement, BlockSpaceStatement,
BlockColumnsStatement, BlockCompositeStatement, BlockClassDefStatement,
BlockClassStatement, BlockStyleStatement, or BlockAccDescrBlockStatement.

### BlockNodeStatement

A node, its width, and the links that follow it: `A`, `A:2`, `A --> B`,
`A -- "text" --> B`.

| Field   | Type                   | Meaning                                                  |
| ------- | ---------------------- | -------------------------------------------------------- |
| `node`  | BlockNode              | The first node.                                          |
| `width` | NumericLiteral or null | The width after the first node; null when there is none. |
| `links` | list of BlockLink      | The links, in source order; may be none.                 |

Child fields: `node`, `width`, `links`. The width belongs to the first node
only, since the grammar allows it nowhere else: `A:2 --> B` has the width 2, and
`A --> B:2` is rejected. A chain of links is one statement: `A --> B --> C` has
two links, as written, while mermaid.js reads it badly (see
[Edge statements](../diagrams/block.md#edge-statements)). [fixture:
block/db-width-before-edge] [fixture: block/db-width-with-label] [fixture:
block/db-edge-arrow] [fixture: block/db-edge-chain]

### BlockNode

A node: an id, with a shape, a block arrow, or neither.

| Field   | Type                                 | Meaning                                       |
| ------- | ------------------------------------ | --------------------------------------------- |
| `id`    | Identifier                           | The id.                                       |
| `shape` | BlockShape, BlockArrowShape, or null | The shape or the block arrow; null when none. |

Child fields: `id`, `shape`. [fixture: block/db-shape-square] [fixture:
block/db-arrow-two]

### BlockShape

A shape with its label: `["text"]`, `(("text"))`.

| Field   | Type          | Meaning                                             |
| ------- | ------------- | --------------------------------------------------- |
| `open`  | string        | The opening as written, such as `[`, `((`, or `[/`. |
| `close` | string        | The closing as written, such as `]`, `))`, or `\]`. |
| `label` | StringLiteral | The string between them.                            |

Child fields: `label`. The opening and the closing are read one after the other
(see [Shapes](../diagrams/block.md#shapes)), so any opening may meet any
closing: `A["x")` has the opening `[` and the closing `)`. Which pairs are
shapes of mermaid.js, and which type the Db gives a pair, is in the summary of
the tests package. [fixture: block/db-shape-square] [fixture:
block/db-shape-round] [fixture: block/db-shape-mixed-square-round]

### BlockArrowShape

A block arrow: `<["text"]>(right, down)`.

| Field        | Type                 | Meaning                                                                           |
| ------------ | -------------------- | --------------------------------------------------------------------------------- |
| `label`      | StringLiteral        | The string between `<[` and `]>`.                                                 |
| `directions` | list of BlockLiteral | The directions, in source order, each with the whitespace it holds; at least one. |

Child fields: `label`, `directions`. A direction is `right`, `left`, `up`,
`down`, `x`, or `y`, with the whitespace written after it, up to the next `,`,
direction, or `)`, and, where no `,` stands before it, with the whitespace
written before it after `(`, as mermaid.js reads a direction; a `,` and the
whitespace after it belong to no direction. The whitespace keeps its characters,
line feeds included, and leaves out the directives and the comment regions, as a
written text does (see [ast.md](../ast.md#nodes)). A direction is a
BlockLiteral, whose range covers its whitespace too, so the range decides how
mermaid.js reads a line terminator in it: a `\r` and a `\n` with a directive
between them are two line terminators (see
[Line terminators](../common.md#line-terminators)). `(right, down)` and
`(rightdown)` have the directions `right` and `down`, `(right , down )` the
directions `right` and `down` each followed by a space, `(right down)` the
directions `right` followed by a space and `down`, `( right)` the direction of a
space and `right`, and `( right , down)` the directions `right` with a space on
each side and `down`. [fixture: block/db-arrow-two] [fixture:
block/db-grid-empty-directions] [fixture: block/db-arrow-spaces-around-comma]
[fixture: block/db-arrow-spaces-around-first] [fixture:
block/db-arrow-comment-line-before-first] [fixture:
block/db-arrow-directive-before-first] [fixture: block/db-arrow-cr-directive-lf]
[fixture: block/db-arrow-spaces] [fixture: block/db-arrow-leading-space]
[fixture: block/db-arrow-trailing-space] [fixture:
block/db-spec-spaces-around-directions] [fixture:
block/db-spec-directions-line-feeds] [fixture: block/db-grid-spaces-directions]
[fixture: block/db-grid-comment-line-directions] [fixture:
block/db-grid-directive-line-directions]

### BlockLink

A link of a node statement: an arrow, or an opening arrow, a label, and an
arrow, and the node it leads to.

| Field     | Type                      | Meaning                                                    |
| --------- | ------------------------- | ---------------------------------------------------------- |
| `opening` | BlockOpeningArrow or null | The opening arrow of a link with a label; null otherwise.  |
| `arrow`   | BlockArrow                | The arrow, or the arrow after the label.                   |
| `label`   | StringLiteral or null     | The label between the two arrows; null when there is none. |
| `target`  | BlockNode                 | The node the link leads to.                                |

Child fields: `opening`, `label`, `arrow`, `target`. They are in source order.
The two arrows of a link with a label may have different lines:
`A -- "text" ==> B` has the opening line `solid` and the line `thick`, and
mermaid.js reads the edge from the second arrow only. [fixture:
block/db-edge-label] [fixture: block/db-edge-label-mismatched]

### BlockArrow

An arrow (see [Edges](../diagrams/block.md#edges)), with the fields of
[FlowchartArrow](./flowchart.md#flowchartarrow).

| Field         | Type    | Meaning                                                                                   |
| ------------- | ------- | ----------------------------------------------------------------------------------------- |
| `value`       | string  | Its written text.                                                                         |
| `startMarker` | string  | The marker before the line: `arrow` for `<`, or `none`.                                   |
| `line`        | string  | `solid` for `-`, `thick` for `=`, or `dotted` for `.`.                                    |
| `length`      | integer | The number of the characters of the line: its `-` or `=`, or, for a dotted line, its `.`. |
| `endMarker`   | string  | The marker after the line: `arrow` for `>`, `cross` for `x`, `circle` for `o`, or `none`. |

No child fields. The words are those of FlowchartArrow; the start markers
`cross` and `circle` and the line `invisible` do not occur, since an id is read
before an arrow (see [Edges](../diagrams/block.md#edges)). `-->` has the line
`solid`, the length 2, and the end marker `arrow`, and `<-->` the start marker
`arrow` too. [fixture: block/db-edge-arrow] [fixture:
block/db-edge-bidirectional]

### BlockOpeningArrow

The opening arrow of a link with a label, with the fields of
[FlowchartOpeningArrow](./flowchart.md#flowchartopeningarrow).

| Field         | Type   | Meaning                                                   |
| ------------- | ------ | --------------------------------------------------------- |
| `value`       | string | Its written text.                                         |
| `startMarker` | string | The marker before the line: `arrow` for `<`, or `none`.   |
| `line`        | string | `solid` for `--`, `thick` for `==`, or `dotted` for `-.`. |

No child fields. Unlike a flowchart, its line need not be the line of the arrow
after the label. [fixture: block/db-edge-label] [fixture:
block/db-edge-label-mismatched]

### BlockSpaceStatement

`space` or `space:N`.

| Field   | Type                   | Meaning                                      |
| ------- | ---------------------- | -------------------------------------------- |
| `width` | NumericLiteral or null | The number after `space:`; null for `space`. |

Child fields: `width`. [fixture: block/db-space-plain] [fixture:
block/db-space-width]

### BlockColumnsStatement

`columns N` or `columns auto`.

| Field   | Type                   | Meaning                                 |
| ------- | ---------------------- | --------------------------------------- |
| `count` | NumericLiteral or null | The number of columns; null for `auto`. |

Child fields: `count`. [fixture: block/db-columns-after-nodes] [fixture:
block/db-columns-only-auto]

### BlockCompositeStatement

A composite: `block:G`, `block`, or `block-beta`, its statements, and `end`.

| Field  | Type                       | Meaning                                                               |
| ------ | -------------------------- | --------------------------------------------------------------------- |
| `head` | BlockNodeStatement or null | The node statement after `block:`; null for `block` and `block-beta`. |
| `body` | list of BlockStatement     | The statements up to `end`, in source order; at least one.            |

Child fields: `head`, `body`. The head is a node statement as any other, with a
width and a shape: `block:G:2` and `block:G["label"]`. An edge statement after
`block:` is the head, as written, which mermaid.js reads as a composite with no
id. [fixture: block/db-composite-end-crlf] [fixture: block/db-composite-no-id]
[fixture: block/db-composite-edge-header] [fixture: block/db-composite-width]
[fixture: block/db-composite-label]

### BlockClassDefStatement

`classDef` with the name of a class and its styles:
`classDef c color:#fff,fill:#000`.

| Field    | Type                           | Meaning                                                                                                                                |
| -------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `name`   | Identifier                     | The name of the class.                                                                                                                 |
| `styles` | list of (BlockLiteral or null) | The styles, the parts between `,` of the rest of the line without the whitespace at its ends, in source order; null for an empty part. |

Child fields: `name`, `styles`. The styles may start on the line after the name:
`classDef c` followed by a line `class A c` has the one style `class A c`. Which
whitespace a style holds is under [BlockLiteral](#blockliteral). [fixture:
block/db-class-def-color-fill] [fixture: block/db-class-def-empty-style]
[fixture: block/db-spec-class-def-name-only-then-class]

### BlockClassStatement

`class` with ids and the name of a class: `class A,B c`.

| Field      | Type                 | Meaning                                                       |
| ---------- | -------------------- | ------------------------------------------------------------- |
| `ids`      | list of BlockLiteral | The ids, the parts between `,`, in source order.              |
| `cssClass` | BlockLiteral or null | The rest of the line, the name of the class; null when empty. |

Child fields: `ids`, `cssClass`. The name of the class is one text, with the
whitespace inside it: `class A c d` has the name `c d`. An id after a `,` starts
right after the `,` and keeps the whitespace there, line feeds included, as
mermaid.js reads the id: `class A, B c` has the ids `A` and a space followed by
`B`, and `class A,` followed by a line `B c` the ids `A` and a line feed
followed by `B`. Whitespace before a `,` ends the ids: `class A ,B c` has the
one id `A` and the name of the class `,B c`. An id is a BlockLiteral, not an
Identifier, since it may hold whitespace. How mermaid.js looks up such an id in
its Db is in the summary of the tests package. [fixture:
block/db-class-def-undefined-use] [fixture: block/db-class-apply-list] [fixture:
block/db-class-apply-names-spaces] [fixture: block/db-class-apply-list-spaces]
[fixture: block/db-class-apply-line-feed-after-comma] [fixture:
block/db-class-apply-list-space-before-comma] [fixture:
block/db-class-apply-comment-line-after-comma] [fixture:
block/db-class-apply-directive-after-comma]

### BlockStyleStatement

`style` with an id and styles: `style A fill:#f00`.

| Field    | Type                           | Meaning                                   |
| -------- | ------------------------------ | ----------------------------------------- |
| `id`     | Identifier                     | The id, commas included.                  |
| `styles` | list of (BlockLiteral or null) | The styles, as in BlockClassDefStatement. |

Child fields: `id`, `styles`. As in a flowchart, the id is one id with its
commas, and the Db looks it up as one text (see
[Rejections outside the grammar](../diagrams/block.md#rejections-outside-the-grammar)).
[fixture: block/db-style-plain]

### BlockAccDescrBlockStatement

An empty description block where a statement starts: `accDescr {}`.

No child fields. It has no fields. The block diagram has no description: a block
with text is rejected, and an empty block inside a statement is the known
divergence `tokenless-empty-forms` (see
[Empty description blocks](../diagrams/block.md#empty-description-blocks)).
[fixture: block/db-empty-block-line] [fixture: block/div-empty-block-in-edge]

### BlockLiteral

The name of a class of `class`, an id of `class`, a style, or a direction of a
block arrow.

| Field   | Type   | Meaning                                           |
| ------- | ------ | ------------------------------------------------- |
| `value` | string | Its written text (see [ast.md](../ast.md#nodes)). |

No child fields. The value keeps the whitespace inside it. A name of a class has
no whitespace at its ends, and an id of `class` keeps the whitespace after the
`,` before it (see [BlockClassStatement](#blockclassstatement)), and a direction
the whitespace that [BlockArrowShape](#blockarrowshape) names. The styles of
`classDef` and `style` are the parts between `,` of the rest of the line without
the whitespace at its ends, as mermaid.js reads them: a style keeps the
whitespace at its ends that lies between it and a `,`, so the first style starts
at its first character that is not whitespace and the last ends at its last such
character. `style A  fill:#f00 ,stroke:#333  ` has the styles `fill:#f00`
followed by a space, and `stroke:#333`, and `style A fill:#f00 , stroke:#333`
the styles `fill:#f00` followed by a space, and a space followed by
`stroke:#333`. A part that is all whitespace is a literal of that whitespace, as
mermaid.js keeps it in a style of `style`: `style A fill:red,  ,stroke:#333` has
a literal of two spaces between two styles. A part with nothing in it is null:
`style A ,` has two nulls, `style A  , fill:#f00` a null first, and
`style A fill:#f00,  ` a null last, since the whitespace at the ends of the rest
of the line belongs to no style. The styles of `classDef` have the same form;
how the Db trims them is in the summary of the tests package. [fixture:
block/db-class-apply-names-spaces] [fixture: block/db-class-def-color-fill]
[fixture: block/db-style-spaces] [fixture: block/db-style-spaces-at-line-ends]
[fixture: block/db-style-whitespace-only-between-commas] [fixture:
block/db-style-tab-only-between-commas] [fixture:
block/db-class-def-whitespace-only-between-commas] [fixture:
block/db-class-def-spaces-around-styles] [fixture:
block/db-style-whitespace-only-first] [fixture:
block/db-style-whitespace-only-last] [fixture: block/db-style-only-comma]
[fixture: block/db-style-directive-before-comma] [fixture:
block/db-class-def-directive-before-comma]
