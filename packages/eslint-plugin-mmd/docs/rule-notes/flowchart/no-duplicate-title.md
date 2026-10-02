# mmd/flowchart/no-duplicate-title

Japanese version: [no-duplicate-title.ja.md](./no-duplicate-title.ja.md)

Notes for implementing the rule
[mmd/flowchart/no-duplicate-title](../../rules/flowchart/no-duplicate-title.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A `FlowchartAccTitleStatement`, also one whose `value` is null, when another
`FlowchartAccTitleStatement` comes before it in the source. The statements are
taken from the `body` of the `FlowchartDiagram` and of every
`FlowchartSubgraphStatement` in it, in the order of their ranges; the rule
reports each one after the first.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `flowchart/db-acc-title-replaces`
- `flowchart/db-acc-title-empty-replaces`
- `flowchart/db-acc-title-outer-replaces-subgraph`
- `flowchart/db-acc-repeated`
- `flowchart/db-acc-title-alone`
