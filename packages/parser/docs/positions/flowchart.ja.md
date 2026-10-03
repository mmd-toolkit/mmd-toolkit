# flowchart の位置

英語版: [flowchart.md](./flowchart.md)

この文書は、`@mmd-toolkit/parser` が作る木の、この図種のノードの範囲を定めます。
すべての図種に共通する決まりは [positions.ja.md](../positions.ja.md) にあります。
ノードは仕様の [`ast/flowchart.ja.md`](../../../spec/docs/ast/flowchart.ja.md) が、
トークンは [tokens/flowchart.ja.md](../tokens/flowchart.ja.md) が定めます。

## 範囲

この図種のノードの範囲です。
[positions.ja.md](../positions.ja.md#ノードの範囲) の規則のほかのものです。

### FlowchartDiagram

FlowchartDiagram のトークンは、
`Directive` と `IgnoredSemicolon` のトークンを除く、
図のテキストのすべてのトークンで、
ヘッダーのキーワードからその最後のものまでです。
どの図の `Root.body` のノードとも同じです
（[ノード](../../../spec/docs/ast.ja.md#ノード) を参照）。
そのため、その範囲は、最後の文の後の区切りのように、
どの文にも属さないトークンも覆います。
`A;` の図の範囲は `;` の後で終わります。
[fixture: flowchart/tokens-diagram-trailing-separator]

### FlowchartEmptyStatement

範囲は、その `;` の範囲です。

### FlowchartVertex

頂点の範囲はそのデータブロックを覆います。
範囲は id から、データブロックがあれば最後のデータブロックまでで、
その頂点を含む頂点のグループと頂点の文の範囲も同じです。

### FlowchartShapeProperty

範囲は、名前から値までです。
その前後の `|` は含みません。

### FlowchartLink

範囲は、リンクの最初のトークンから、その行き先の最後のトークンまでです。

### FlowchartArrow

範囲はそのトークンで、単位が前後に持つ空白を除いた矢印です。
矢印の中のディレクティブや無視される `;` は入力を拒否させるので、
2 つ以上のトークンを持つ矢印はありません
（[トークン](../tokens.ja.md#トークン) を参照）。
[fixture: flowchart/div-ignored-semicolon-in-arrow]

### FlowchartOpeningArrow

範囲は、[FlowchartArrow](#flowchartarrow) と同じく、そのトークンです。

### FlowchartLabel

すべて空白のラベルはトークンを持ちません。
トークンを持たないどのノードとも同じく、
その範囲はその単位を覆います
（[positions.ja.md](../positions.ja.md#ノードの範囲) を参照）。

### FlowchartLiteral

そのトークンは `RawText` のトークンです。
1 つで、単位の間のディレクティブがテキストを切るときはそれより多くなります
（[common.ja.md](../../../spec/docs/common.ja.md#ディレクティブはトークンの境界) を参照）。

リテラルは必ずトークンを持ちます。

### FlowchartDataBlock

フロントマターと違い、値の範囲を別に持ちません。
値はブロックのトークンの中にあります。

### FlowchartIgnoredText

そのトークンは `RawText` のトークンです。
1 つで、ディレクティブがテキストを切るときはそれより多くなります。
`A-%%{init: {}}%%->B direction LR` の `direction` の前のテキストは `A-->B`
です。

範囲は最初のトークンから最後のトークンまでです。

### FlowchartSubgraphStatement

タイトルがなければ、名前のトークンと範囲は、その後の空白を覆います。
文字列の後では、その空白はそれだけで 1 つの `RawText` のトークンです。
空白 1 つが続く `subgraph "S"` がそうです。
[fixture: flowchart/db-subgraph-string-name-trailing-space]
空の説明ブロックが名前のすぐ後に続くときは、その間の空白と、
最後のブロックと `;` の間の空白は、どのトークンにも属しません。

### FlowchartStyleStatement

行単位の規則が無視する `;` はスタイルを切ります。
空白 2 つが続く `style A fill:#f00;` は、スタイルのトークン `fill:#f00` と、
その後の `IgnoredSemicolon` のトークンを持ち、
空白 2 つはどちらの外にもあります。
`style A fill:#f00;stroke:#0f0` の 1 つのスタイルは 2 つのトークンを持ちます。
ディレクティブも同じように切ります。
`style A fill:#f00, %%{init: {}}%%` に空白 2 つと `stroke:#333` が続くと、
2 つ目のスタイルの最初のトークンはディレクティブの前の空白です。
[fixture: flowchart/tokens-style-ignored-semicolon-then-spaces]
[fixture: flowchart/tokens-style-directive-after-comma]

### FlowchartClickUrlStatement

どちらの型でも、クリックの文の範囲は、
そのクリックの id を読んだクリックの文脈に入った `click` の単位から始まります。
文の文法が始まる単位です。
その `click` は範囲の中の `Keyword` のトークンで、どの欄にも属しません。

### FlowchartDirectionStatement

範囲は方向の行の全体なので、両方のテキストの範囲を覆います。
