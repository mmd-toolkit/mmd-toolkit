# Sankey の位置

英語版: [sankey.md](./sankey.md)

この文書は、`@mmd-toolkit/parser` が作る木の、この図種のノードの範囲を定めます。
すべての図種に共通する決まりは
[positions.ja.md](../positions.ja.md) にあります。
ノードは仕様の
[`ast/sankey.ja.md`](../../../spec/docs/ast/sankey.ja.md) が、
トークンは [tokens/sankey.ja.md](../tokens/sankey.ja.md) が定めます。

## 範囲

この図種のノードの範囲です。
[positions.ja.md](../positions.ja.md#ノードの範囲) の規則のほかのものです。

### SankeyDiagram

範囲は、どの図の `Root.body` のノードとも同じ定めに従います
（[ノードの範囲](../positions.ja.md#ノードの範囲) を参照）。
ヘッダーのキーワードから、最後のレコードの最後のトークンまでです。
[fixture: sankey/db-link-basic]
[fixture: sankey/db-header-beta]

### SankeyLinkStatement

範囲は、source から value までで、文字列の引用符を含みます。
レコードの周りの空白と、その後の改行は、範囲の外にあります。
`  a , b , 1` と 2 つの空白は、`a , b , 1` を覆います。
[fixture: sankey/db-fields-trimmed]
[fixture: sankey/db-quoted-fields]
[fixture: sankey/db-spaces-only-source-id-first-record]

### SankeyIdentifier と SankeyLiteral

範囲はそのトークンの範囲で、両端の空白を除いた欄です。
値は、その範囲の書かれたテキストです。
前後に空白のある `a` は `a` を、`a b` は `a b` を覆います。
空白だけの欄は、値が空で、範囲はその空白です。
その 1 つのトークンが範囲を覆います
（[トークン](../tokens/sankey.ja.md#トークン) を参照）。
`a, ,1` の target は、2 つのコンマの間の空白を覆います。
この図種で、値が範囲の書かれたテキストでないノードは、これだけです。
書かれたテキストは空で、トークンがノードに位置を与えます。
[fixture: sankey/db-fields-trimmed]
[fixture: sankey/db-text-with-spaces]
[fixture: sankey/db-spaces-only-source-id]
[fixture: sankey/db-spaces-only-target-id]
[fixture: sankey/db-spaces-only-value]
