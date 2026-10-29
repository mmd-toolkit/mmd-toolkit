# Timeline の位置

英語版: [timeline.md](./timeline.md)

この文書は、`@mmd-toolkit/parser` が作る木の、この図種のノードの範囲を定めます。
すべての図種に共通する決まりは [positions.ja.md](../positions.ja.md)
にあります。
ノードは仕様の [`ast/timeline.ja.md`](../../../spec/docs/ast/timeline.ja.md)
が、トークンは [tokens/timeline.ja.md](../tokens/timeline.ja.md) が定めます。

## 範囲

この図種のノードの範囲です。
[positions.ja.md](../positions.ja.md#ノードの範囲) の規則のほかのものです。

### TimelineDiagram

範囲は、
どの図の `Root.body`
のノードとも同じ定めに従います（[ノードの範囲](../positions.ja.md#ノードの範囲)
を参照）。

### TimelinePeriodStatement と TimelineEventStatement

範囲は、period か最初の event のコロンから、
最後の event の最後のトークンまでで、その間の行にわたります。
`a` と `: e1` の行と `: e2` の行は、`a` から `e2` まで 3 つの行を覆います。
間に空行があっても同じです。
period や event が終わりに保つ空白は、範囲の中にあります。
`a :` と 2 つの空白は、 `a :` と event の空白を覆います。
[fixture: timeline/db-event-own-line]
[fixture: timeline/db-event-own-line-after-blank-line]
[fixture: timeline/db-event-two-spaces]
[fixture: timeline/db-event-after-section-joins-earlier-task]

### TimelineTitleStatement と TimelineSectionStatement

範囲は、キーワードから、テキストの終わりまでです。
トークンが保つテキストの終わりの空白も含みます。
[トークン](../tokens/timeline.ja.md#トークン) を参照。
`title T` と 3 つの空白は、 3 つの空白も覆います。
[fixture: timeline/db-title-trailing-spaces]
[fixture: timeline/db-section-trailing-spaces]

### TimelineAccTitleStatement と TimelineAccDescrStatement

範囲は、キーワードから、テキストの空白でない最後の文字までです。
値が除く行末の空白は、範囲の外にあります。
[fixture: timeline/db-acc-title-trailing-spaces]

### TimelineLiteral

範囲はそのトークンの範囲で、トークンが両端の空白を保つところでは、
それを含みます（[トークン](../tokens/timeline.ja.md#トークン) を参照）。
値はその範囲の書かれたテキストです。
`a : e` の period は、 `a` とコロンの前の空白を覆います。
[fixture: timeline/db-period-and-event]
[fixture: timeline/db-period-trailing-spaces]
