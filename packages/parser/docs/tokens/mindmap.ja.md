# Mindmap のトークン

英語版: [mindmap.md](./mindmap.md)

この文書は、`@mmd-toolkit/parser` が作る木の、
図種 `mindmap` のトークンを定めます。
ノードは仕様の
[`ast/mindmap.ja.md`](../../../spec/docs/ast/mindmap.ja.md) が定めます。
すべての図種に共通のトークンは [tokens.ja.md](../tokens.ja.md) が定めます。

## トークン

トークンは、
[diagrams/mindmap.ja.md](../../../spec/docs/diagrams/mindmap.ja.md#字句構造)
の単位から作ります。
すべて空白ではない単位は、
[文法](../../../spec/docs/diagrams/mindmap.ja.md#文法) の **項目** の
1 つに属し、この表がその項目に与える種類を持ちます。

| 種類         | 項目とその単位                                                                                                                                                        |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | `header` 単位。`::icon(` 単位                                                                                                                                         |
| `RawText`    | [単位の中のディレクティブ](../../../spec/docs/diagrams/mindmap.ja.md#単位の中のディレクティブ) のテキストの単位: `node-text`、`shape-text`、`icon-text`、`class-text` |
| `String`     | [単位の中のディレクティブ](../../../spec/docs/diagrams/mindmap.ja.md#単位の中のディレクティブ) の文字列の単位: 区切りを含む `string` と `markdown-string`             |
| `Punctuator` | `:::` 単位と、icon の行の `)` 単位。`opener` と `closer` の単位                                                                                                       |

[fixture: mindmap/db-header-only]
[fixture: mindmap/db-icon-line]
[fixture: mindmap/db-class-line]
[fixture: mindmap/db-shape-rect]
[fixture: mindmap/db-shape-string]
[fixture: mindmap/db-shape-markdown-string]

どの項目も 1 つの単位で、したがって 1 つの **トークン** です。
`r["text with ( paren"]` は、`RawText` トークン `r`、
`Punctuator` トークン `[` と `]`、
引用符を含む `String` トークン `"text with ( paren"` を持ちます。
`::icon(fa fa-book)` は、`Keyword` トークン `::icon(`、
`RawText` トークン `fa fa-book`、`Punctuator` トークン `)` を持ちます。
[fixture: mindmap/db-shape-string]
[fixture: mindmap/db-icon-line]

トークンは両端に空白を持ちません。
ただし mermaid.js が値の一部として読むところは別です
（[トークン](../tokens.ja.md#トークン) を参照）。
どのテキストの単位も、読んだ空白を mermaid.js が値に残すので、
トークンもそれを残します。
ノードのテキストは終わりの空白を残します。
`root` と 3 つの空白のトークンは、`root` と 3 つの空白です。
形のテキスト、icon、class は、両端の空白を残します。
`a[ "x" ]` の形のテキストは、空白、`"x"`、空白です。
`::icon( x )` の icon は、空白、`x`、空白です。
`:::  x` の class は、2 つの空白と `x` です。
形のテキストは、中の改行を持ちます。
`a[x`、改行、`y]` は、`x`、改行、`y` のトークンを持ちます。
[fixture: mindmap/db-node-trailing-whitespace]
[fixture: mindmap/gram-shape-text-quoted-with-space]
[fixture: mindmap/db-icon-surrounding-whitespace]
[fixture: mindmap/db-class-leading-whitespace]
[fixture: mindmap/gram-shape-text-line-feed]

`RawText` トークンや `String` トークンの中のディレクティブ、コメント領域、
行の規則が無視する `;` は、
[ディレクティブが切るトークン](../tokens.ja.md#ディレクティブが切るトークン)
のとおり、トークンを断片に切ります。
切られた `String` トークンは `StringFragment` トークンになります。
ほかの種類のトークンの中では、
ディレクティブや無視される `;` は入力を拒否させます
（[単位の中のディレクティブ](../../../spec/docs/diagrams/mindmap.ja.md#単位の中のディレクティブ)
を参照）。
`a%%{init: {}}%%b` は、`RawText` トークン `a` と `b` と、
その間の `Directive` トークンを持ちます。
``r["`a%%{init: {}}%%b`"]`` は、
`StringFragment` トークン ``"`a`` と ``b`"`` を持ちます。
一方、opener `((` の中にディレクティブがある
`a(%%{init: {}}%%(x))` は拒否されます。
markdown 文字列の区切りの 2 文字の間のディレクティブも、トークンを切ります。
``a["`x`%%{init: {}}%%"]`` は、
`StringFragment` トークン `` "`x` `` と `"` を持ちます。
[fixture: mindmap/lex-directive-in-node-text]
[fixture: mindmap/lex-directive-in-markdown-string]
[fixture: mindmap/div-directive-in-opener]
[fixture: mindmap/lex-directive-between-backquote-and-quote]

行の規則が無視する `;` は `IgnoredSemicolon` トークンです。
ノードのテキスト `style:#x;y` は、`RawText` トークン `style:#x` と `y` と、
その間の `IgnoredSemicolon` トークンを持ちます。
[fixture: mindmap/tokens-ignored-semicolon-in-node-text]
