# 四象限チャートの位置

英語版: [quadrant.md](./quadrant.md)

この文書は、`@mmd-toolkit/parser` が作る木の、この図種のノードの範囲を定めます。
すべての図種に共通する決まりは [positions.ja.md](../positions.ja.md) にあります。
ノードは仕様の [`ast/quadrant.ja.md`](../../../spec/docs/ast/quadrant.ja.md) が、
トークンは [tokens/quadrant.ja.md](../tokens/quadrant.ja.md) が定めます。

## 範囲

この図種のノードの範囲です。
[positions.ja.md](../positions.ja.md#ノードの範囲) の規則のほかのものです。

### QuadrantDiagram

範囲は、
どの図の `Root.body` のノードとも同じ定めに従います（[ノードの範囲](../positions.ja.md#ノードの範囲) を参照）。
ヘッダーのキーワードから、
最後のトークンまでです。 [fixture: quadrant/db-point-plain]

### 文

文の範囲は、最初のトークン、つまりキーワードか点の名前から、
最後のトークンまでです。
キーワード、矢印、点の `]` が前後に読む空白は含みません。
テキストのない題は `title` を覆います。
矢印で終わる軸の文は矢印を覆い、点はそのスタイルを覆います。
`x-axis L -->` は行の全体を覆い、
`A: [0.3, 0.6] radius: 10, color: #f00` は `#f00` までを覆います。
説明ブロックは、テキストの行にわたって、
その `}` までを覆います。 [fixture: quadrant/db-title-keyword-alone]
[fixture: quadrant/db-x-axis-left-with-arrow]
[fixture: quadrant/db-style-two]
[fixture: quadrant/db-acc-descr-block-lines]

### QuadrantLabel

範囲は最初のトークンから最後のトークンまでで、語の間の空白を含み、
両端の U+00A0 も含みます（[トークン](../tokens/quadrant.ja.md#トークン) を参照）。
`quadrant-1   A  b   ` は `A  b` を覆います。
引用符のないテキストでは、値は範囲の書かれたテキストです。
文字列や markdown 文字列で始まるテキストでは、範囲は開きの引用符からで、
値は引用符とバッククォートを含みません。
`quadrant-1 "a" b` は `"a" b` を覆い、
値は `a b` です。 [fixture: quadrant/db-quadrant-spaces-trimmed]
[fixture: quadrant/db-quadrant-quoted-then-bare]
[fixture: quadrant/db-name-markdown]

### QuadrantLiteral、QuadrantIdentifier、Identifier

範囲はトークンの範囲で、トークンが除く両端の空白を含みません。
値は、
範囲の書かれたテキストです（[トークン](../tokens/quadrant.ja.md#トークン) を参照）。
座標はその文字を覆います。
スタイルとクラスの名前は、両端の ASCII の空白を除いたテキストを覆います。
`] radius: 10, color: #f00` の `radius: 10` がそうです。
題、アクセシビリティのテキスト、説明ブロックのテキストは、
両端の Notation の空白を U+00A0 も含めて除いたテキストを覆います。
説明ブロックでは、
`{` の後の空白と `}` の前の空白の間の行を覆います。 [fixture: quadrant/db-point-plain]
[fixture: quadrant/db-style-two]
[fixture: quadrant/db-acc-descr-block-lines]
[fixture: quadrant/db-class-plain]
[fixture: quadrant/db-classdef-two-styles]
[fixture: quadrant/db-grid-nbsp-classdef-name]
[fixture: quadrant/db-title-nbsp-before-text]
[fixture: quadrant/db-acc-descr-block-nbsp-before-brace-close]
