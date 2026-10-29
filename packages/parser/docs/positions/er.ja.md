# ER の位置

英語版: [er.md](./er.md)

この文書は、`@mmd-toolkit/parser` が作る木の、この図種のノードの範囲を定めます。
すべての図種に共通する決まりは [positions.ja.md](../positions.ja.md)
にあります。
ノードは仕様の [`ast/er.ja.md`](../../../spec/docs/ast/er.ja.md) が、
トークンは [tokens/er.ja.md](../tokens/er.ja.md) が定めます。

## 範囲

この図種のノードの範囲です。
[positions.ja.md](../positions.ja.md#ノードの範囲) の規則のほかのものです。

### ErDiagram

範囲は、
どの図の `Root.body`
のノードとも同じ定めに従います（[ノードの範囲](../positions.ja.md#ノードの範囲)
を参照）。

### ErRelationship

それぞれの濃度と線は、それぞれ 1 つのトークンです。
範囲は、間の空白を越えて、最初のものから最後のものまでです。
`A || -- o{ B : has` では、 `||` から `o{` までです。
[fixture: er/lex-relationship-spaces-in-spec]

### ErSubgraphStatement

範囲は `subgraph` から `end` までです。
`end` 単位がキーワードの後に読む空白は、範囲の外にあります。
[fixture: er/lex-end-blank-line-then-name]

### ErDirectionStatement

範囲は、方向の行の全体を、最初のトークンから最後のトークンまで覆います。
[fixture: er/lex-direction-line-text-before]
[fixture: er/lex-direction-line-text-after]

### ErLiteral

スタイルの範囲は、間の空白を越えて、最初のトークンから最後のトークンまでです。
値はその空白を除きます。
`classDef a fill : #f9f` では `fill : #f9f` を覆い、値は `fill:#f9f` です。
[fixture: er/lex-classdef-style-spaces]

### ErIgnoredText

`empty-backquotes` 単位の並びの範囲は、最初のものから最後のものまでです。
値は、間の空白を含めた、その範囲の書かれたテキストです。
[fixture: er/gram-empty-backquotes-twice]
[fixture: er/gram-empty-backquotes-run-across-line-feed]
[fixture: er/gram-empty-backquotes-run-across-comment-line]
[fixture: er/gram-empty-backquotes-run-across-directive]
