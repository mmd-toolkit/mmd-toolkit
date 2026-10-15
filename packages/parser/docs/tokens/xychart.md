# XY chart tokens

Japanese version: [xychart.ja.md](./xychart.ja.md)

This document defines the tokens of the diagram type `xychart` in the tree that
`@mmd-toolkit/parser` produces. The nodes are defined by the specification in
[`ast/xychart.md`](../../../spec/docs/ast/xychart.md); the tokens shared by all
diagram types are defined in [tokens.md](../tokens.md).

## Tokens

The tokens are made from the units of
[diagrams/xychart.md](../../../spec/docs/diagrams/xychart.md#lexical-structure).
Every unit that is not all whitespace belongs to one **item** of
[the grammar](../../../spec/docs/diagrams/xychart.md#grammar) and has the kind
that this table gives for the item:

| Kind         | Items and their units                                                                                                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | the `header`, `orientation`, `title`, `x-axis`, `y-axis`, `line`, `bar`, `accTitle`, and `accDescr` units                                                                                                              |
| `RawText`    | the words of a text without quotes, an XychartLiteral of `word` units; the text of an accessibility statement, an XychartLiteral of an `acc-title-text`, an `acc-description-text`, or a `description-block-text` unit |
| `String`     | a `string` unit: a text in quotes, a [StringLiteral](../../../spec/docs/ast.md#stringliteral), quotes included                                                                                                         |
| `Numeric`    | a `number` unit: a [NumericLiteral](../../../spec/docs/ast.md#numericliteral) of a range or of a value                                                                                                                 |
| `Punctuator` | `[`, `]`, `,`, `;`, `:`, `{`, `}`, and `-->`                                                                                                                                                                           |

[fixture: xychart/db-orientation-capitalized] [fixture:
xychart/db-title-bare-words] [fixture: xychart/db-acc-title-spaces-trimmed]
[fixture: xychart/db-label-one] [fixture: xychart/db-x-axis-range] [fixture:
xychart/db-semicolon-statements]

A `newline` unit is all whitespace and makes no token, while a `;` that ends a
line is a `Punctuator` token: `title T; x-axis [a]` has the tokens `title`, `T`,
`;`, `x-axis`, `[`, `a`, and `]`. [fixture: xychart/db-semicolon-statements]

The words of a text without quotes that follow one another with nothing between
them are one token, and whitespace between two words belongs to no token:
`title a-b_c.d+e=f*g&h#i1` has one `RawText` token of its text, which is
eighteen `word` units, and `title Two words` the two tokens `Two` and `words`.
The text of an accessibility statement is one token, the whitespace between its
characters and its line feeds included, without the whitespace at its ends:
`accTitle:` followed by `a b` and spaces has the token `a b`. [fixture:
xychart/db-title-bare-characters] [fixture: xychart/db-title-bare-words]
[fixture: xychart/db-acc-title-spaces-trimmed] [fixture:
xychart/db-acc-descr-block]

An empty string that the grammar takes, as the title of a plot or of an axis or
as a label, is a `String` token of its two quotes: `line "" [1]` has the
`String` token `""`. A description block whose text is whitespace only, an empty
description block, has the tokens of `accDescr`, `{`, and `}` only, and one that
is not closed has no `}`. An `accTitle:` or `accDescr:` at the end of the text
without a text has the tokens of the keyword and the `:` only. [fixture:
xychart/db-grid-empty-plot-title-quoted] [fixture:
xychart/db-acc-descr-block-empty] [fixture: xychart/db-acc-descr-unclosed-block]
[fixture: xychart/db-acc-title-empty]

A directive, a comment region, or a `;` that the line rule ignores inside a
`RawText` or a `String` token cuts it into fragments, as
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)
says; inside a token of any other kind, a directive or an ignored `;` makes the
input rejected (see
[Directives inside units](../../../spec/docs/diagrams/xychart.md#directives-inside-units)):
the category `a%%{init: {}}%%b` has the `RawText` tokens `a` and `b` with the
`Directive` token between them, and `title "style:#x;y"` the `StringFragment`
tokens `"style:#x` and `y"` with the `IgnoredSemicolon` token between them,
while `ti%%{init: {}}%%tle T` is rejected. [fixture:
xychart/db-x-axis-band-directive-in-word] [fixture:
xychart/lex-title-style-line-semicolon] [fixture:
xychart/div-directive-in-keyword] [fixture:
xychart/div-ignored-semicolon-in-value]
