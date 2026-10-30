# Block diagram tokens

Japanese version: [block.ja.md](./block.ja.md)

This document defines the tokens of the diagram type `block` in the tree that
`@mmd-toolkit/parser` produces. The nodes are defined by the specification in
[`ast/block.md`](../../../spec/docs/ast/block.md); the tokens shared by all
diagram types are defined in [tokens.md](../tokens.md).

## Tokens

The tokens are made from the units of
[diagrams/block.md](../../../spec/docs/diagrams/block.md#lexical-structure).
Every unit that is not all whitespace belongs to one **item** of
[the grammar](../../../spec/docs/diagrams/block.md#grammar) and has the kind
that this table gives for the item:

| Kind         | Items and their units                                                                                                                                                                                                                                                                                                                                                               |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | the header, `block-beta` or `block`; the `block-beta`, `block:`, and `block` units that open a composite, `block:` with its `:`; `end`; the `columns` unit, without its number, and `auto`; `space` and `space:`, with its `:`, without its number; `classDef`, `class`, and `style`; the `accDescr` of an empty description block; and the word of each direction of a block arrow |
| `Identifier` | an `id`; the `class-id` of `classDef`; the word of each id of the `class-ids` of `class`, without the whitespace before it; and the `class-ids` of `style`, one token with its `,`                                                                                                                                                                                                  |
| `Numeric`    | the digits of a width, of `space:`, and of `columns`                                                                                                                                                                                                                                                                                                                                |
| `String`     | a `string` unit, with its quotes                                                                                                                                                                                                                                                                                                                                                    |
| `RawText`    | the class name of `class`; each style; the whitespace after a `,` between two ids of `class`; and the whitespace that a direction of a block arrow holds, before its word and after it                                                                                                                                                                                              |
| `Punctuator` | the opening and the closing of a shape, each one token as written; `<[`, `]>`, the `(` and the `)` around the directions, and a `,` before a direction; the `:` of a width; an arrow and an opening arrow; a `,` between two ids of `class` and between two styles; and the `{` and the `}` of an empty description block                                                           |

[fixture: block/db-edge-arrow] [fixture: block/db-composite-width] [fixture:
block/db-composite-no-id] [fixture: block/db-composite-plain] [fixture:
block/db-columns-plain] [fixture: block/db-columns-auto] [fixture:
block/db-space-plain] [fixture: block/db-space-width] [fixture:
block/db-class-def-two-styles] [fixture: block/db-class-apply-list] [fixture:
block/db-grid-comma-style-id] [fixture: block/db-empty-block-between] [fixture:
block/db-arrow-two] [fixture: block/db-shape-lean-left] [fixture:
block/db-edge-label] [fixture: block/db-width-plain]

Whitespace, line feeds included, reads no unit in the statement context and
makes no token there. An arrow and an opening arrow leave out the whitespace
around them, and a keyword the whitespace after it: `A -- "text" --> B` has the
tokens `A`, `--`, `"text"`, `-->`, and `B`, and `columns 3` the `Keyword` token
`columns` and the `Numeric` token `3`. A direction of a block arrow is the
`Keyword` token of its word, and the whitespace that its value holds (see
[BlockArrowShape](../../../spec/docs/ast/block.md#blockarrowshape)), after the
`(` before it and after it, is a `RawText` token on each side, which a directive
or a comment line cuts, while one inside the word makes the input rejected:
`( right , down)` has the `RawText` token of the space, the `Keyword` token
`right`, the `RawText` token of the space, the `Punctuator` token `,`, and the
`Keyword` token `down`. The whitespace after a `,` is in no token. The class
name of `class` is one `RawText` token, with the whitespace inside it:
`class A c d` has the `RawText` token `c d`. [fixture: block/db-edge-label]
[fixture: block/db-columns-plain] [fixture: block/db-arrow-spaces-around-first]
[fixture: block/db-arrow-directive-before-first] [fixture:
block/db-arrow-comment-line-before-first] [fixture:
block/db-class-apply-names-spaces]

An id of `class` after a `,` holds the whitespace after the `,` (see
[BlockClassStatement](../../../spec/docs/ast/block.md#blockclassstatement)),
which is a `RawText` token of its own, before the `Identifier` token of its
word: `class A, B c` has the `Identifier` token `A`, the `Punctuator` token `,`,
the `RawText` token of the space, and the `Identifier` token `B`. A directive or
a comment line in that whitespace cuts the `RawText` token, while one inside the
word makes the input rejected, as inside every id. The id of `style` is one
`Identifier` token, from its first word to its last, with its `,`: the ids of
`style A, B` would be one token `A, B`, which no accepted input has, since no
block has an id with whitespace (see
[Rejections outside the grammar](../../../spec/docs/diagrams/block.md#rejections-outside-the-grammar)).
[fixture: block/db-class-apply-list-spaces] [fixture:
block/db-class-apply-line-feed-after-comma] [fixture:
block/db-grid-comma-style-id] [fixture: block/div-grid-directive-class-apply-id]

A style is one `RawText` token over its whole value, the part between two `,`
with the whitespace at its ends that lies between it and a `,` (see
[BlockLiteral](../../../spec/docs/ast/block.md#blockliteral)): the first style
starts at the first character of the rest of the line that is not whitespace,
and the last ends at its last such character. `style A fill:#f00 , stroke:#333`
has the `RawText` tokens `fill:#f00` with the space after it and `stroke:#333`
with the space before it, and a part that is all whitespace, as in
`style A fill:red,  ,stroke:#333`, is a `RawText` token of that whitespace. An
empty part makes no token. [fixture: block/db-style-spaces] [fixture:
block/db-style-spaces-at-line-ends] [fixture:
block/db-style-whitespace-only-between-commas] [fixture:
block/db-class-def-spaces-around-styles] [fixture:
block/db-class-def-leading-comma] [fixture: block/db-style-only-comma]

A directive, a comment region, or a `;` that the line rule ignores inside a
`RawText` or a `String` token cuts it into fragments, as
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)
says; inside a token of any other kind, an `Identifier` token included, a
directive or an ignored `;` makes the input rejected (see
[Directives inside units](../../../spec/docs/diagrams/block.md#directives-inside-units)):
`A -- "a%%{init: {}}%%b" --> B` has the `StringFragment` tokens `"a` and `b"`
with a `Directive` token between them, while `A%%{init: {}}%%B` is rejected.
[fixture: block/db-edge-label-directive] [fixture:
block/db-grid-directive-style-text] [fixture: block/db-class-apply-directive]
[fixture: block/div-directive-in-id] [fixture:
block/div-ignored-semicolon-in-id]
