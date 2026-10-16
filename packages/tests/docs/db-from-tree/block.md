# Building the block Db from the tree

Japanese version: [block.ja.md](./block.ja.md)

`src/db-from-tree/block.ts` implements these steps for the tree of
[ast/block.md](../../../spec/docs/ast/block.md), following the readings of
[db-summaries.md, block](../db-summaries.md#block), with the syntax of
[diagrams/block.md](../../../spec/docs/diagrams/block.md). The hand-made trees
of `tests/db-from-tree-block.test.ts` compare these steps with the Db in each
cited fixture's `expected.json`, in memory and after a JSON round trip; recorded
block trees are a later stage.

## Building the summary from the tree

1. **Converted form.** Read text in
   [converted form](../../../spec/docs/common.md#reading-a-source): CR and CRLF
   become LF, an HTML attribute quote becomes `'`, an entity becomes its
   placeholder, and directives, comment regions, and the `IgnoredSemicolon`
   tokens of the line rule are left out. [fixture: block/db-label-cr] [fixture:
   block/db-label-crlf] [fixture: block/db-label-html-attribute-double]
   [fixture: block/db-label-entity-numeric] [fixture:
   block/db-label-entity-named] [fixture: block/db-label-directive] [fixture:
   block/db-label-directive-line] [fixture: block/db-label-comment-line]
   [fixture: block/db-grid-style-rule-label]
2. **Labels.** A StringLiteral gives the converted text between its quotes,
   including whitespace at its ends, followed by the replacement of characters
   below. [fixture: block/db-label-padded] [fixture: block/db-label-spaces]
   [fixture: block/config-security-level-other-all]
3. **Numbers.** Read a NumericLiteral's converted digits with decimal
   `parseInt`, rather than its `value` (which JSON may have made null), and
   write a non-finite number as its text through `numberOrText`. [fixture:
   block/db-width-zero] [fixture: block/db-width-leading-zeros] [fixture:
   block/db-width-overflow] [fixture: block/db-columns-leading-zeros] [fixture:
   block/db-columns-overflow]
4. **Initial state.** Start with the block `root`, of type `composite`, with
   `columns: -1`, no label, and an empty list of children, and empty tables of
   blocks and classes and an empty edge list, with `root` first in the block
   table. [fixture: block/db-columns-only-auto] [fixture:
   block/db-name-no-final-line-feed]
5. **The walk.** Walk statements in source order, entering each composite after
   putting it in the table and visiting its children before continuing the
   surrounding list. [fixture: block/db-collecting-depth-first]
6. **Definitions.** A block of an id already in the table updates the earlier
   block's type unless the new type is `na`, and its label unless the new label
   equals the id, preserving the first width, directions, columns, classes,
   styles, children, and placement, while the new block and its children list
   are discarded. [fixture: block/db-collecting-redefine-type-na-keeps]
   [fixture: block/db-collecting-redefine-label-equal-id] [fixture:
   block/db-collecting-redefine-label-only-odd] [fixture:
   block/db-definitions-three-widths] [fixture:
   block/db-collecting-redefine-keeps-directions] [fixture:
   block/db-collecting-composite-then-node-shape-width] [fixture:
   block/db-composite-id-same-composite] [fixture:
   block/db-composite-id-same-nested] [fixture:
   block/db-composite-id-same-as-child] [fixture:
   block/db-collecting-two-composites-share-child]
7. **Unplaced blocks.** List table entries unreachable through the root's
   children as `unplaced`, in table order, listing a descendant only inside its
   unplaced ancestor, retaining the blocks of discarded composites, their
   spaces, and the blocks made by `class`, which edges, classes, and styles can
   still find. [fixture: block/db-unplaced-order] [fixture:
   block/db-unplaced-order-defined-later] [fixture:
   block/db-unplaced-nested-composite] [fixture:
   block/db-unplaced-columns-in-dropped] [fixture:
   block/db-unplaced-dropped-with-width] [fixture: block/db-unplaced-space]
   [fixture: block/db-unplaced-edge-into-dropped] [fixture:
   block/db-unplaced-class-on-unplaced-child] [fixture:
   block/db-unplaced-style-on-unplaced]
8. **Columns.** The last columns statement in a list sets its parent's columns,
   independently of every other list, with `auto` giving `-1` and `0` staying
   `0`, without changing a node's width. [fixture:
   block/db-collecting-columns-per-composite] [fixture:
   block/db-definitions-columns-three] [fixture: block/db-columns-only-auto]
   [fixture: block/db-columns-twice-auto-last] [fixture: block/db-columns-zero]
   [fixture: block/db-columns-with-width]
9. **Nodes.** A node without a shape has its converted id as both id and label,
   type `na`, and `widthInColumns` of its width or 1, preserving the case of the
   id. [fixture: block/db-name-no-final-line-feed] [fixture: block/db-name-case]
   [fixture: block/db-width-zero] [fixture: block/db-width-leading-zeros]
10. **Shapes.** A shape gives its label and the type of its written opening and
    closing pair in the table below, or `na` for any other pair, keeping the
    label in that case too. [fixture: block/db-shape-mixed-square-round]
11. **Block arrows.** A BlockArrowShape gives type `block_arrow` and its label,
    and takes its directions from the list of the tree, one for each
    BlockLiteral, in order: the converted text of its range, which holds the
    whitespace written with the word (see ast/block.md, BlockArrowShape). The
    range, not a string of the tree, tells a CR and a LF with a directive
    between them, which are two line terminators, from a CRLF. [fixture:
    block/db-arrow-cr-directive-lf] [fixture: block/db-arrow-all] [fixture:
    block/db-arrow-spaces] [fixture: block/db-arrow-leading-space] [fixture:
    block/db-arrow-leading-comma] [fixture: block/db-arrow-trailing-space]
    [fixture: block/db-arrow-glued-words] [fixture: block/db-arrow-up-down]
    [fixture: block/db-arrow-twice] [fixture: block/db-arrow-line-feed]
12. **Redefined arrows.** Redefining a block arrow keeps its first directions,
    giving an arrow to an existing shape adds no directions, and giving a shape
    to an arrow keeps its directions. [fixture:
    block/db-collecting-redefine-keeps-directions] [fixture:
    block/db-arrow-redefine-from-square] [fixture:
    block/db-arrow-redefine-to-square]
13. **Spaces.** `space` makes one block of type `space` and width 1, and
    `space:N` makes N blocks each of width N in source order, with no id or
    label, so `space:0` makes none and leading zeros are decimal digits.
    [fixture: block/db-space-plain] [fixture: block/db-space-width] [fixture:
    block/db-space-width-zero] [fixture: block/db-space-leading-zeros] [fixture:
    block/db-unplaced-space]
14. **Composites.** A composite takes the id, width, label, and directions of
    its head, with the type replaced by `composite` and a missing label replaced
    by the empty text, or has no id or width and the empty label when it has no
    head, and holds the children produced by its body. [fixture:
    block/db-composite-label] [fixture: block/db-composite-width] [fixture:
    block/db-composite-block-arrow] [fixture: block/db-composite-no-id]
    [fixture: block/db-composite-id-same-as-node-before]
15. **Edge heads.** A composite whose head has links has no id, width, or head
    label, and keeps only its type `composite`, empty label, and the children
    and columns of its body, with no edge from the head. [fixture:
    block/db-composite-edge-header] [fixture:
    block/db-composite-edge-header-width]
16. **Edges.** A one-link statement adds its first node without a width, then
    its edge, then its target without a width, and edges retain source order
    through composites and repeated edges. [fixture:
    block/db-width-on-edge-source] [fixture: block/db-edge-keeps-width]
    [fixture: block/db-collecting-edge-order-in-composite] [fixture:
    block/db-definitions-edges-three]
17. **Edge fields.** An edge has its start and end ids and its label or the
    empty text, thickness `thick` for a thick line and `normal` otherwise,
    pattern `dotted` for a dotted line and `solid` otherwise, start marker
    `arrow_point` or `arrow_open`, and end marker `arrow_point`, `arrow_cross`,
    `arrow_circle`, or the empty text, taking all arrow fields from the closing
    arrow alone and no length. [fixture: block/db-edge-arrow] [fixture:
    block/db-edge-open] [fixture: block/db-edge-thick] [fixture:
    block/db-edge-dotted] [fixture: block/db-edge-cross] [fixture:
    block/db-edge-circle] [fixture: block/db-edge-bidirectional] [fixture:
    block/db-edge-label-mismatched] [fixture: block/db-edge-long] [fixture:
    block/db-edge-thick-open] [fixture: block/db-edge-thick-long] [fixture:
    block/db-edge-dotted-open] [fixture: block/db-edge-dotted-long] [fixture:
    block/db-edge-label-bidirectional]
18. **Edge directions.** An edge takes the directions written on its target if
    that node has a block arrow, and none from its source. [fixture:
    block/db-edge-to-block-arrow] [fixture: block/db-edge-from-block-arrow]
19. **Chains.** A statement with more than one link loses every node and edge
    before its last link, replacing its source with the single fieldless block
    shared by all chains, so the summary has `{}` and an edge with no `start`,
    followed by the last target, without preventing a lost node from being
    defined later. [fixture: block/db-edge-chain] [fixture:
    block/db-edge-chain-four] [fixture: block/db-edge-chain-labels] [fixture:
    block/db-edge-chain-twice] [fixture: block/db-edge-chain-then-node]
20. **Class definitions.** Take the converted text of each style of the
    statement, the empty text for a null, remove the first `;` of each, trim
    each, and append the styles, empty parts included, to that class, keeping
    first-definition order even across composites and repeated definitions.
    [fixture: block/db-class-def-color-fill] [fixture:
    block/db-class-def-spaces-around-styles] [fixture:
    block/db-class-def-empty-style] [fixture: block/db-class-def-leading-comma]
    [fixture: block/db-class-def-three] [fixture: block/db-class-def-twice-same]
    [fixture: block/db-class-def-in-block] [fixture:
    block/db-class-def-semicolon-end] [fixture:
    block/db-class-def-semicolon-middle] [fixture:
    block/db-grid-semicolon-class-def-style] [fixture:
    block/db-grid-style-rule-class-def-style]
21. **Class applications.** Take the converted text of each id of the tree,
    which holds the whitespace after the comma before it and is not trimmed, and
    append the converted, trimmed class name or the empty text as one class,
    keeping repeats and names with spaces or commas whether a classDef exists or
    not. [fixture: block/db-class-apply-list] [fixture:
    block/db-class-apply-list-spaces] [fixture:
    block/db-class-apply-names-spaces] [fixture:
    block/db-class-apply-names-list] [fixture: block/db-class-apply-no-name]
    [fixture: block/db-class-apply-same-twice]
22. **Class-created blocks.** An id not found by that lookup makes a block under
    the trimmed id, with type `na`, no label or width, and an empty children
    list, replacing a table entry under that trimmed id if one exists, and a
    later definition changes only its type and label and leaves it unplaced.
    [fixture: block/db-class-apply-list-spaces] [fixture:
    block/db-class-apply-undefined-list] [fixture:
    block/db-class-apply-before-node-width] [fixture:
    block/db-class-apply-before-block]
23. **Styles.** Look up a style statement's id as one converted text with its
    commas, require an earlier block, and take the converted text of each style
    of the statement, the empty text for a null, and replace the styles of the
    block with them in order, with the whitespace around a comma kept and a
    whitespace-only part kept as it is, or change nothing when the statement has
    no style but the one null part. [fixture: block/db-grid-comma-style-id]
    [fixture: block/db-style-spaces] [fixture:
    block/db-grid-semicolon-style-text] [fixture: block/db-style-only-comma]
    [fixture: block/db-style-then-none] [fixture:
    block/db-definitions-style-three-empty-middle] [fixture:
    block/db-grid-style-rule-style-text]
24. **Root and prototypes.** The id `root` refers to the diagram block, whose id
    is omitted from the summary and whose columns and children stay when a shape
    changes its type and label, and all other ids, including `__proto__` and
    `constructor`, are ordinary Map keys. [fixture: block/db-proto-root-columns]
    [fixture: block/db-proto-root-style] [fixture: block/db-composite-root-id]
    [fixture: block/db-class-def-proto] [fixture: block/db-class-apply-proto-id]
    [fixture: block/db-composite-constructor-id]
25. **No Db effect.** Empty description blocks, the frontmatter title, and
    drawing settings add nothing to the summary. [fixture:
    block/db-empty-block-between] [fixture: block/db-frontmatter-config-block]
    [fixture: block/header-after-frontmatter]
26. **Summary.** Return `root`, `unplaced`, `edges`, and `classes`, omitting
    empty children lists of non-composites, generated ids and space labels, edge
    ids and types, palette indices, derived text styles, and layout. [fixture:
    block/db-collecting-depth-first] [fixture: block/db-space-width] [fixture:
    block/db-composite-no-id] [fixture: block/db-class-def-color-fill] [fixture:
    block/db-edge-arrow]

The shape pairs of step 10:

| Open  | Close | Db type               | Fixture                                       |
| ----- | ----- | --------------------- | --------------------------------------------- |
| `[`   | `]`   | `square`              | [fixture: block/db-shape-square]              |
| `(`   | `)`   | `round`               | [fixture: block/db-shape-round]               |
| `((`  | `))`  | `circle`              | [fixture: block/db-shape-circle]              |
| `(((` | `)))` | `doublecircle`        | [fixture: block/db-shape-doublecircle]        |
| `([`  | `])`  | `stadium`             | [fixture: block/db-shape-stadium]             |
| `[[`  | `]]`  | `subroutine`          | [fixture: block/db-shape-subroutine]          |
| `[(`  | `)]`  | `cylinder`            | [fixture: block/db-shape-cylinder]            |
| `{`   | `}`   | `diamond`             | [fixture: block/db-shape-diamond]             |
| `{{`  | `}}`  | `hexagon`             | [fixture: block/db-shape-hexagon]             |
| `>`   | `]`   | `rect_left_inv_arrow` | [fixture: block/db-shape-rect-left-inv-arrow] |
| `[/`  | `/]`  | `lean_right`          | [fixture: block/db-shape-lean-right]          |
| `[\`  | `\]`  | `lean_left`           | [fixture: block/db-shape-lean-left]           |
| `[/`  | `\]`  | `trapezoid`           | [fixture: block/db-shape-trapezoid]           |
| `[\`  | `/]`  | `inv_trapezoid`       | [fixture: block/db-shape-inv-trapezoid]       |

## The replacement of characters

27. Apply `textReplacementOf(embedded.config)` of
    [db-from-tree.md](../db-from-tree.md#the-replacement-of-characters) only to
    the labels of nodes, block arrows, composites, and edges, after reading
    their converted contents, leaving ids, classes, styles, and directions
    alone. [fixture: block/config-security-level-other-all]
