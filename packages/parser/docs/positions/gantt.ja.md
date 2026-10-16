# Gantt の位置

英語版: [gantt.md](./gantt.md)

この文書は、`@mmd-toolkit/parser` が作る木の、この図種のノードの範囲を定めます。
すべての図種に共通する決まりは
[positions.ja.md](../positions.ja.md) にあります。
ノードは仕様の [`ast/gantt.ja.md`](../../../spec/docs/ast/gantt.ja.md) が、
トークンは [tokens/gantt.ja.md](../tokens/gantt.ja.md) が定めます。

## 範囲

この図種のノードの範囲です。
[positions.ja.md](../positions.ja.md#ノードの範囲) の規則のほかのものです。

### GanttDiagram

範囲は、どの図の `Root.body` のノードとも同じ定めに従います
（[ノードの範囲](../positions.ja.md#ノードの範囲) を参照）。

### GanttTaskStatement

範囲は、説明から、データの最後のトークンまでです。
最後のトークンは、最後の項目か、
後の項目が null のときは最後の `,` か、
データが空白だけのときは `:` です。
`a : 1d,` は `a : 1d,` を覆い、
`a :` と 3 つの空白は `a :` を覆います。
[fixture: gantt/gram-task]
[fixture: gantt/gram-task-trailing-comma]
[fixture: gantt/lex-task-data-whitespace-only]

### GanttClickStatement

範囲は、`click` から、ソースの順で最後の部分の最後のトークンまでです。
それはリンクの閉じの `"` か、call の `)` で、子の欄の順にはよりません。
[fixture: gantt/gram-click-href]
[fixture: gantt/gram-click-call-then-href]

### GanttCallback

範囲は `call` から `)` までです。
[fixture: gantt/gram-click-call]
[fixture: gantt/gram-click-call-arguments]

### GanttIncludesStatement と GanttExcludesStatement

範囲は、キーワードから、リストのテキストの最後の項目か `,` までです。
リストのテキストが空白だけの文は、キーワードだけを覆います。
[fixture: gantt/db-includes-tokens]
[fixture: gantt/db-excludes-tokens]
[fixture: gantt/lex-excludes-whitespace-value]

### GanttAccTitleStatement と GanttAccDescrStatement

範囲は、キーワードから、テキストの空白でない最後の文字までです。
値が除く行末の空白は、範囲の外にあります。
[fixture: gantt/gram-acc-title-trailing-spaces]

### GanttLiteral

範囲はそのトークンの範囲で、トークンが両端の空白を保つところでは、それを含みます
（[トークン](../tokens/gantt.ja.md#トークン) を参照）。
値はその範囲の書かれたテキストです。
`a  : 1d` の説明は、`a` とコロンの前の 2 つの空白を覆います。
`title T` と 2 つの空白のタイトルは、`T` と 2 つの空白を覆います。
[fixture: gantt/lex-task-text-trailing-spaces]
[fixture: gantt/lex-title-trailing-spaces]
