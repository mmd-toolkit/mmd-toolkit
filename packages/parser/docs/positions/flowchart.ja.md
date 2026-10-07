# flowchart の位置

英語版: [flowchart.md](./flowchart.md)

この文書は、`@mmd-toolkit/parser` が作る木の、この図種のノードの範囲を定めます。
すべての図種に共通する決まりは
[positions.ja.md](../positions.ja.md) にあります。
ノードは仕様の
[`ast/flowchart.ja.md`](../../../spec/docs/ast/flowchart.ja.md) が、
トークンは [tokens/flowchart.ja.md](../tokens/flowchart.ja.md) が定めます。

## 範囲

この図種のノードの範囲です。
[positions.ja.md](../positions.ja.md#ノードの範囲) の規則のほかのものです。

### FlowchartDiagram

範囲は、どの図の `Root.body` のノードとも同じ定めに従います
（[ノードの範囲](../positions.ja.md#ノードの範囲) を参照）。

### FlowchartEmptyStatement

範囲は、その `;` の範囲です。
[fixture: flowchart/gram-empty-statement-top-level]

### FlowchartVertex

頂点の範囲はそのデータブロックを覆います。
範囲は id から、データブロックがあれば最後のデータブロックまでで、
その頂点を含む頂点のグループと頂点の文の範囲も同じです。
[fixture: flowchart/gram-data-consecutive-blocks]

### FlowchartShapeProperty

範囲は、名前から値までです。
その前後の `|` は含みません。
[fixture: flowchart/gram-rect-property]

### FlowchartLink

範囲は、リンクの最初のトークンから、その行き先の最後のトークンまでです。
[fixture: flowchart/gram-edge-id]

### FlowchartArrow

範囲はそのトークンで、単位が前後に持つ空白を除いた矢印です。
[fixture: flowchart/lex-directive-after-arrow]
矢印の中のディレクティブや無視される `;` は入力を拒否させるので、
2 つ以上のトークンを持つ矢印はありません
（[トークン](../tokens.ja.md#トークン) を参照）。
[fixture: flowchart/div-ignored-semicolon-in-arrow]
[fixture: flowchart/div-directive-in-arrow-length]

### FlowchartOpeningArrow

範囲は、[FlowchartArrow](#flowchartarrow) と同じく、そのトークンです。
[fixture: flowchart/db-arrow-dash-head-length]
開く矢印の中のディレクティブや無視される `;` は、矢印の中と同じく、
入力を拒否させます。
[fixture: flowchart/div-ignored-semicolon-in-opening-arrow]
[fixture: flowchart/div-directive-in-opening-arrow]

### FlowchartLabel

すべて空白のラベルは、その空白の 1 つの `RawText` のトークンを持ち
（[flowchart のトークン](../tokens/flowchart.ja.md#トークン) を参照）、
その範囲はそのトークンです。
[fixture: flowchart/gram-label-space]

### FlowchartLiteral

そのトークンは `RawText` のトークンです。
1 つで、単位の間のディレクティブがテキストを切るときはそれより多くなります
（[common.ja.md](../../../spec/docs/common.ja.md#ディレクティブはトークンの境界)
を参照）。
[fixture: flowchart/lex-acc-title-space-before-colon]
[fixture: flowchart/lex-directive-in-title]

リテラルは必ずトークンを持ちます。

### FlowchartDataBlock

フロントマターと違い、値の範囲を別に持ちません。
値はブロックのトークンの中にあります。
[fixture: flowchart/gram-data-block-space-only]

### FlowchartIgnoredText

そのトークンは `RawText` のトークンです。
1 つで、ディレクティブがテキストを切るときはそれより多くなります。
`A-%%{init: {}}%%->B direction LR` の `direction` の前のテキストは `A-->B`
です。
[fixture: flowchart/lex-direction-line-after-directive-in-text]

範囲は最初のトークンから最後のトークンまでです。

### FlowchartSubgraphStatement

タイトルがなければ、名前のトークンと範囲は、その後の空白を覆います。
文字列の後では、その空白はそれだけで 1 つの `RawText` のトークンです。
空白 1 つが続く `subgraph "S"` がそうです。
[fixture: flowchart/db-subgraph-name-space-before-empty-description-block]
[fixture: flowchart/db-subgraph-string-name-trailing-space]
空の説明ブロックが名前のすぐ後に続くときは、その間の空白と、
最後のブロックと `;` の間の空白は、どのトークンにも属しません。
[fixture: flowchart/db-subgraph-name-space-between-empty-description-blocks]
[fixture:
flowchart/db-subgraph-name-space-after-empty-description-block-before-semicolon]

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
[fixture: flowchart/tokens-style-ignored-semicolon-between-values]

### FlowchartClickUrlStatement

どちらの型でも、クリックの文の範囲は、
そのクリックの id を読んだクリックの文脈に入った `click` の単位から始まります。
文の文法が始まる単位です。
その `click` は範囲の中の `Keyword` のトークンで、どの欄にも属しません。
[fixture: flowchart/gram-click-href]
[fixture: flowchart/gram-click-call]

### FlowchartDirectionStatement

範囲は方向の行の全体なので、両方のテキストの範囲を覆います。
[fixture: flowchart/lex-direction-line-in-label]
