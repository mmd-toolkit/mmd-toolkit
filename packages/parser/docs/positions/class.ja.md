# class の位置

英語版: [class.md](./class.md)

この文書は、`@mmd-toolkit/parser` が作る木の、この図種のノードの範囲を定めます。
すべての図種に共通する決まりは [positions.ja.md](../positions.ja.md) にあります。
ノードは仕様の [`ast/class.ja.md`](../../../spec/docs/ast/class.ja.md) が、
トークンは [tokens/class.ja.md](../tokens/class.ja.md) が定めます。

## 範囲

この図種のノードの範囲です。
[positions.ja.md](../positions.ja.md#ノードの範囲) の規則のほかのものです。

### ClassDiagram

範囲は、
どの図の `Root.body` のノードとも同じ定めに従います（[ノードの範囲](../positions.ja.md#ノードの範囲) を参照）。

### ClassArrow

各関係の端と線は、それぞれトークンです。
矢印の範囲は、
最初のものから最後のものまでです。 [fixture: class/gram-relation-spaces]

### ClassDirectionStatement

範囲は方向の行の全体です。 [fixture: class/lex-direction-line-in-label]

### ClassAnnotation

範囲は `<<` から `>>` までです。 [fixture: class/db-annotation-after-relation]

### ClassLiteral

空白だけのテキストが値であるところでは、
`class A~ ~` と本体の `<<  >>` のように、
その空白のトークンを持ちます。 [fixture: class/tokens-generic-blank]
[fixture: class/tokens-annotation-blank]
