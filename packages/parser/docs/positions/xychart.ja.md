# XY チャートの位置

英語版: [xychart.md](./xychart.md)

この文書は、`@mmd-toolkit/parser` が作る木の、この図種のノードの範囲を定めます。
すべての図種に共通する決まりは
[positions.ja.md](../positions.ja.md) にあります。
ノードは仕様の
[`ast/xychart.ja.md`](../../../spec/docs/ast/xychart.ja.md) が、
トークンは [tokens/xychart.ja.md](../tokens/xychart.ja.md) が定めます。

## 範囲

この図種のノードの範囲です。
[positions.ja.md](../positions.ja.md#ノードの範囲) の規則のほかのものです。

### XychartDiagram

範囲は、どの図の `Root.body` のノードとも同じ定めに従います
（[ノードの範囲](../positions.ja.md#ノードの範囲) を参照）。
最初のヘッダーのキーワードから、最後のトークンまでです。
[fixture: xychart/db-orientation-capitalized]
[fixture: xychart/header-twice]

### XychartHeader

範囲は、ヘッダーのキーワードからその向きまでです。
向きがないときはキーワードを覆います。
`xychart-beta Horizontal` は行の全体を覆います。
[fixture: xychart/db-orientation-capitalized]
[fixture: xychart/header-twice]

### 文

文の範囲は、そのキーワードから最後のトークンまでで、その間の行にわたります。
テキストのない `accTitle:` や `accDescr:` は、キーワードと `:` を覆います。
テキストが後の行にあるものは、そのテキストまでの行を覆います。
説明ブロックはその `}` を覆います。
閉じていないものは、そのテキストで終わり、テキストがなければ `{` で終わります。
[fixture: xychart/db-x-axis-band-title]
[fixture: xychart/db-acc-title-empty]
[fixture: xychart/db-acc-title-takes-next-line]
[fixture: xychart/db-acc-descr-block]
[fixture: xychart/db-acc-descr-unclosed-block]
[fixture: xychart/db-acc-descr-unclosed-empty-block-spaces]

### XychartBand、XychartRange、XychartValue

XychartBand はその `[` から `]` まで、
XychartRange は最初の数から 2 つ目の数までです。
XychartValue は、その数からラベルまでで、ラベルがないときは数を覆います。
`[1 "a", 2]` の最初の値は、`1 "a"` を覆います。
[fixture: xychart/db-x-axis-band-title]
[fixture: xychart/db-x-axis-range]
[fixture: xychart/db-label-one]

### XychartLiteral

範囲は、最初のトークンから最後のトークンまでです。
引用符のないテキストでは、最初の語から最後の語までで、間の空白を含みます。
値はその空白を除くので、範囲より短くなります。
`title Two words` は `Two words` を覆い、値は `Twowords` です。
アクセシビリティの文のテキストでは、両端の空白を除いたテキストを覆い、
説明ブロックの改行を含みます。
[fixture: xychart/db-title-bare-words]
[fixture: xychart/db-acc-title-spaces-trimmed]
[fixture: xychart/db-acc-descr-block]
