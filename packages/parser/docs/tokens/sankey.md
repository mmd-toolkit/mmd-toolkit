# Sankey tokens

Japanese version: [sankey.ja.md](./sankey.ja.md)

This document defines the tokens of the diagram type `sankey` in the tree that
`@mmd-toolkit/parser` produces. The nodes are defined by the specification in
[`ast/sankey.md`](../../../spec/docs/ast/sankey.md); the tokens shared by all
diagram types are defined in [tokens.md](../tokens.md).

## Tokens

The tokens are made from the units of
[diagrams/sankey.md](../../../spec/docs/diagrams/sankey.md#lexical-structure).
Every unit that is not all whitespace belongs to one **item** of
[the grammar](../../../spec/docs/diagrams/sankey.md#grammar) and has the kind
that this table gives for the item:

| Kind         | Items and their units                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | the `header` unit, `sankey` or `sankey-beta`                                                                    |
| `RawText`    | a `field-text` unit: a field without quotes, the id of a node (SankeyIdentifier) or a value (SankeyLiteral)     |
| `String`     | a `string` unit: a field in quotes, a [StringLiteral](../../../spec/docs/ast.md#stringliteral), quotes included |
| `Punctuator` | `,`                                                                                                             |

[fixture: sankey/db-link-basic] [fixture: sankey/db-header-beta] [fixture:
sankey/db-quoted-fields]

Every item is one unit, and so one **token**: `a,b,1` has the `RawText` tokens
`a`, `b`, and `1` with a `Punctuator` token `,` between each two. A `newline`
unit is all whitespace and makes no token. A field without quotes is `RawText`
also as an id: it may hold spaces between its characters, as `a b` does, and its
value is no number, since a value may be any text. [fixture:
sankey/db-link-basic] [fixture: sankey/db-text-with-spaces] [fixture:
sankey/db-value-not-a-number]

A `RawText` token holds no spaces at its ends, as the value of its node leaves
them out: `  a , b , 1` followed by two spaces has the tokens `a`, `b`, and `1`.
A field of spaces only, whose value is empty, has one `RawText` token of its
spaces, so that its node has a token (see
[SankeyIdentifier and SankeyLiteral](../positions/sankey.md#sankeyidentifier-and-sankeyliteral)):
`a, ,1` has the token of the space between its commas. A `String` token runs
from the opening quote to the closing one, with the line feeds of the string.
[fixture: sankey/db-fields-trimmed] [fixture: sankey/db-spaces-only-target-id]
[fixture: sankey/db-spaces-only-source-id] [fixture:
sankey/db-spaces-only-value] [fixture: sankey/db-quoted-line-feed]

A directive, a comment region, or a `;` that the line rule ignores inside a
`RawText` or a `String` token cuts it into fragments, as
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)
says; inside the header, a directive makes the input rejected (see
[Directives inside units](../../../spec/docs/diagrams/sankey.md#directives-inside-units)).
`"b%%{init: {}}%%c"` has the `StringFragment` tokens `"b` and `c"` with the
`Directive` token between them, a comment line inside a string cuts its `String`
token in the same way, and `style:#x;y` has the `RawText` tokens `style:#x` and
`y` with the `IgnoredSemicolon` token between them. [fixture:
sankey/db-directive-in-field] [fixture: sankey/db-directive-in-quotes] [fixture:
sankey/db-quoted-comment-line] [fixture: sankey/lex-style-line-semicolon-source]
[fixture: sankey/lex-style-line-semicolon-in-quotes] [fixture:
sankey/div-directive-in-header-keyword]
