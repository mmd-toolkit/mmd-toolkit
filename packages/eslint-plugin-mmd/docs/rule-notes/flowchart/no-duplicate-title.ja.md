# mmd/flowchart/no-duplicate-title

英語版: [no-duplicate-title.md](./no-duplicate-title.md)

規則 [mmd/flowchart/no-duplicate-title](../../rules/flowchart/no-duplicate-title.ja.md) を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

`FlowchartAccTitleStatement`（`value` が null のものも含む）のうち、
ソースでそれより前に、別の `FlowchartAccTitleStatement` があるもの。
文は、`FlowchartDiagram` と、その中のすべての `FlowchartSubgraphStatement` の
`body` から、範囲の順に取る。
規則は、最初のもの以外をすべて報告する。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `flowchart/db-acc-title-replaces`
- `flowchart/db-acc-title-empty-replaces`
- `flowchart/db-acc-title-outer-replaces-subgraph`
- `flowchart/db-acc-repeated`
- `flowchart/db-acc-title-alone`
