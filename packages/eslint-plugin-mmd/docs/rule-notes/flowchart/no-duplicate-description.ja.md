# mmd/flowchart/no-duplicate-description

英語版: [no-duplicate-description.md](./no-duplicate-description.md)

規則 [mmd/flowchart/no-duplicate-description](../../rules/flowchart/no-duplicate-description.ja.md) を実装するための覚え書き。

この規則はまだ実装していない。
ここには、実装するときに要ることを書く。

## 木での現れ方

説明を設定する文のうち、ソースでそれより前に、説明を設定する別の文があるもの。
説明を設定する文は、
`FlowchartAccDescrStatement`（`value` が null のものも含む）と、
`closed` が true で、
`value` が null でない `FlowchartAccDescrBlockStatement` である。
文は、`FlowchartDiagram` と、その中のすべての `FlowchartSubgraphStatement` の
`body` から、範囲の順に取る。
規則は、最初のもの以外をすべて報告する。

## fixture

規則が依拠する mermaid.js の読み方は、
`@mmd-toolkit/tests` の次の fixture に記録されている。

- `flowchart/db-acc-descr-replaces`
- `flowchart/db-acc-descr-line-replaces-block`
- `flowchart/db-acc-descr-block-replaces`
- `flowchart/db-acc-descr-outer-replaces-subgraph`
- `flowchart/db-acc-descr-empty-replaces`
- `flowchart/db-acc-descr-empty-block-keeps`
- `flowchart/db-acc-repeated`
- `flowchart/db-acc-descr-line-alone`
