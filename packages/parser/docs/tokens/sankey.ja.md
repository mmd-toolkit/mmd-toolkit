# Sankey のトークン

英語版: [sankey.md](./sankey.md)

この文書は、`@mmd-toolkit/parser` が作る木の、
図種 `sankey` のトークンを定めます。
ノードは仕様の [`ast/sankey.ja.md`](../../../spec/docs/ast/sankey.ja.md)
が定めます。
すべての図種に共通のトークンは [tokens.ja.md](../tokens.ja.md) が定めます。

## トークン

トークンは、
[diagrams/sankey.ja.md](../../../spec/docs/diagrams/sankey.ja.md#字句構造)
の単位から作ります。
すべて空白ではない単位は、
[文法](../../../spec/docs/diagrams/sankey.ja.md#文法) の **項目** の 1
つに属し、この表がその項目に与える種類を持ちます。

| 種類         | 項目とその単位                                                                                             |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| `Keyword`    | `header` 単位。`sankey` か `sankey-beta`                                                                   |
| `RawText`    | `field-text` 単位。引用符のない欄で、ノードの id（SankeyIdentifier）か値（SankeyLiteral）                  |
| `String`     | `string` 単位。引用符のある欄で、[StringLiteral](../../../spec/docs/ast.ja.md#stringliteral)。引用符を含む |
| `Punctuator` | `,`                                                                                                        |

[fixture: sankey/db-link-basic] [fixture: sankey/db-header-beta]
[fixture: sankey/db-quoted-fields]

どの項目も 1 つの単位で、したがって 1 つの **トークン** です。
`a,b,1` は、`RawText` トークン `a`、`b`、`1` を持ち、
その 2 つずつの間に `Punctuator` トークン `,` を持ちます。
`newline` 単位はすべて空白なので、トークンを作りません。
引用符のない欄は、id としても `RawText` です。
`a b` のように文字の間に空白を持つことがあり、値はどんなテキストでもよいので、
数ではないからです。 [fixture: sankey/db-link-basic]
[fixture: sankey/db-text-with-spaces] [fixture: sankey/db-value-not-a-number]

`RawText` トークンは、両端に空白を持ちません。
そのノードの値が、それを除くからです。
`  a , b , 1` と 2 つの空白は、トークン `a`、`b`、`1` を持ちます。
空白だけの欄は、値が空で、その空白の `RawText` トークンを 1 つ持ちます。
そのノードがトークンを持つためです。
[SankeyIdentifier と SankeyLiteral](../positions/sankey.ja.md#sankeyidentifier-と-sankeyliteral)
を参照。
`a, ,1` は、2 つのコンマの間の空白のトークンを持ちます。
`String` トークンは、開きの引用符から閉じの引用符までで、
文字列の改行を含みます。 [fixture: sankey/db-fields-trimmed]
[fixture: sankey/db-spaces-only-target-id]
[fixture: sankey/db-spaces-only-source-id]
[fixture: sankey/db-spaces-only-value] [fixture: sankey/db-quoted-line-feed]

`RawText` トークンや `String` トークンの中のディレクティブ、コメント領域、
行の規則が無視する `;` は、
[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン)
のとおり、トークンを断片に切ります。
ヘッダーの中のディレクティブは、入力を拒否させます。
[単位の中のディレクティブ](../../../spec/docs/diagrams/sankey.ja.md#単位の中のディレクティブ)
を参照。
`"b%%{init: {}}%%c"` は、`StringFragment` トークン `"b` と `c"` と、
その間の `Directive` トークンを持ちます。
文字列の中のコメント行も、同じように `String` トークンを切ります。
`style:#x;y` は、`RawText` トークン `style:#x` と `y` と、
その間の `IgnoredSemicolon` トークンを持ちます。
[fixture: sankey/db-directive-in-field] [fixture: sankey/db-directive-in-quotes]
[fixture: sankey/db-quoted-comment-line]
[fixture: sankey/lex-style-line-semicolon-source]
[fixture: sankey/lex-style-line-semicolon-in-quotes]
[fixture: sankey/div-directive-in-header-keyword]
