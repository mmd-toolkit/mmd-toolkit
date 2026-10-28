# ブロック図の位置

英語版: [block.md](./block.md)

この文書は、`@mmd-toolkit/parser` が作る木の、この図種のノードの範囲を定めます。
すべての図種に共通する決まりは [positions.ja.md](../positions.ja.md) にあります。
ノードは仕様の [`ast/block.ja.md`](../../../spec/docs/ast/block.ja.md) が、
トークンは [tokens/block.ja.md](../tokens/block.ja.md) が定めます。

## 範囲

この図種のノードの範囲です。
[positions.ja.md](../positions.ja.md#ノードの範囲) の規則のほかのものです。

### BlockDiagram

範囲は、
どの図の `Root.body` のノードとも同じ定めに従います（[ノードの範囲](../positions.ja.md#ノードの範囲) を参照）。
ヘッダーのキーワードから、
最後のトークンまでです。 [fixture: block/db-edge-arrow]

### 文

文の範囲は、最初のトークンから最後のトークンまでです。
ノードの文は id から最後のリンクの終わりまで、入れ子のブロックは `block:`、
`block`、`block-beta` から `end` まで、中の文の行にわたります。
`classDef`、`class`、`style` の文はキーワードから最後のトークンまでで、
スタイルが `,` で終わるときはその `,` までです。
`style A ,` は行の全体を覆います。
空の説明ブロックは `accDescr` から `}` までを覆います。 [fixture: block/db-edge-chain]
[fixture: block/db-composite-width]
[fixture: block/db-style-only-comma]
[fixture: block/db-class-apply-no-name]
[fixture: block/db-empty-block-between]

### BlockNode、BlockShape、BlockArrowShape

ノードは id から形かブロック矢印の終わりまでで、間の空白を含みます。
形は開きから閉じまで、
ブロック矢印は `<[` から方向の後の `)` までです。 [fixture: block/db-spec-space-before-round]
[fixture: block/db-shape-circle]
[fixture: block/db-arrow-two]

### BlockLink、BlockArrow、BlockOpeningArrow

リンクは、その矢印か開きの矢印から、行き先のノードの終わりまでです。
矢印と開きの矢印はそのトークンを覆い、前後の空白を含みません。
`A -- "text" --> B` のリンクは `-- "text" --> B` です。 [fixture: block/db-edge-label]
[fixture: block/db-edge-chain]

### BlockLiteral、Identifier、NumericLiteral、StringLiteral

範囲は、ノードの最初のトークンの始まりから最後のトークンの終わりまでで、
値は範囲の書かれたテキストです。
スタイルは、`,` との間にある両端の空白を含めて、その値の全体を覆い、
すべて空白のスタイルはその空白を覆います。
`style A fill:#f00 , stroke:#333` のスタイルは、
後にスペースのある `fill:#f00` と、前にスペースのある `stroke:#333` です。
`,` の後の `class` の id は、`,` の後の空白とその語を覆い、 `style` の id は、
`,` を含めて最初の語から最後の語までを覆います。
ブロック矢印の方向は、その語と、それが持つ空白を覆います。
空白は後ろのものと、`,` が前にない最初の方向では `(` の後のものです。
`( right , down)` の方向は、両側にスペースのある `right` と、`down` です。
`class` のクラス名、これら以外の Identifier、数は、
空白でない最初の文字から最後の文字までです。
文字列は引用符を覆い、値は引用符の間です。 [fixture: block/db-style-spaces]
[fixture: block/db-style-whitespace-only-between-commas]
[fixture: block/db-class-apply-list-spaces]
[fixture: block/db-grid-comma-style-id]
[fixture: block/db-class-apply-names-spaces]
[fixture: block/db-arrow-spaces-around-first]
[fixture: block/db-edge-label]
