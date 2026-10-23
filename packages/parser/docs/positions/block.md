# Block diagram positions

Japanese version: [block.ja.md](./block.ja.md)

This document defines the ranges of the nodes of the diagram type in the tree
that `@mmd-toolkit/parser` produces, besides the rules shared by all diagram
types in [positions.md](../positions.md). The nodes are defined by the
specification in [`ast/block.md`](../../../spec/docs/ast/block.md); the tokens
in [tokens/block.md](../tokens/block.md).

## Ranges

The ranges of the nodes of this diagram type, besides the rules of
[positions.md](../positions.md#node-ranges):

### BlockDiagram

The range is that of the node in `Root.body` of every diagram (see
[Node ranges](../positions.md#node-ranges)): from the header keyword to the last
token. [fixture: block/db-edge-arrow]

### Statements

The range of a statement runs from its first token to its last: a node statement
from its id to the end of its last link, a composite from `block:`, `block`, or
`block-beta` to its `end`, over the lines of its statements, and a `classDef`,
`class`, or `style` statement from its keyword to its last token, which is a `,`
where the styles end with one: `style A ,` covers the whole line. An empty
description block covers `accDescr` to `}`. [fixture: block/db-edge-chain]
[fixture: block/db-composite-width] [fixture: block/db-style-only-comma]
[fixture: block/db-class-apply-no-name] [fixture: block/db-empty-block-between]

### BlockNode, BlockShape, and BlockArrowShape

A node runs from its id to the end of its shape or block arrow, the whitespace
between them included; a shape from its opening to its closing, and a block
arrow from `<[` to the `)` after its directions. [fixture:
block/db-spec-space-before-round] [fixture: block/db-shape-circle] [fixture:
block/db-arrow-two]

### BlockLink, BlockArrow, and BlockOpeningArrow

A link runs from its arrow, or from its opening arrow, to the end of the node it
leads to; an arrow and an opening arrow cover their token, without the
whitespace around them: `A -- "text" --> B` has the link `-- "text" --> B`.
[fixture: block/db-edge-label] [fixture: block/db-edge-chain]

### BlockLiteral, Identifier, NumericLiteral, and StringLiteral

The range runs from the start of the first token of the node to the end of the
last, and the value is the written text of the range. A style covers its whole
value, the whitespace at its ends that lies between it and a `,` included, and a
style that is all whitespace covers that whitespace:
`style A fill:#f00 , stroke:#333` has the styles `fill:#f00` with the space
after it and `stroke:#333` with the space before it. An id of `class` after a
`,` covers the whitespace after the `,` and its word, the id of `style` covers
its first word to its last, with its `,`, and a direction of a block arrow
covers its word with the whitespace that it holds, after it and, for the first
when no `,` stands before it, after the `(`: `( right , down)` has the
directions `right` with a space on each side and `down`. A name of a class of
`class`, an Identifier other than these, and a number start at their first
character that is not whitespace and end at their last. A string covers its
quotes, and its value is what lies between them. [fixture:
block/db-style-spaces] [fixture: block/db-style-whitespace-only-between-commas]
[fixture: block/db-class-apply-list-spaces] [fixture:
block/db-grid-comma-style-id] [fixture: block/db-class-apply-names-spaces]
[fixture: block/db-arrow-spaces-around-first] [fixture: block/db-edge-label]
