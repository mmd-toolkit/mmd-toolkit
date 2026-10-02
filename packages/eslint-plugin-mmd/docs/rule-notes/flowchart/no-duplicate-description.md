# mmd/flowchart/no-duplicate-description

Japanese version:
[no-duplicate-description.ja.md](./no-duplicate-description.ja.md)

Notes for implementing the rule
[mmd/flowchart/no-duplicate-description](../../rules/flowchart/no-duplicate-description.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A statement that sets the description, when another statement that sets the
description comes before it in the source. A statement that sets the description
is a `FlowchartAccDescrStatement`, also one whose `value` is null, or a
`FlowchartAccDescrBlockStatement` whose `closed` is true and whose `value` is
not null. The statements are taken from the `body` of the `FlowchartDiagram` and
of every `FlowchartSubgraphStatement` in it, in the order of their ranges; the
rule reports each one after the first.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `flowchart/db-acc-descr-replaces`
- `flowchart/db-acc-descr-line-replaces-block`
- `flowchart/db-acc-descr-block-replaces`
- `flowchart/db-acc-descr-outer-replaces-subgraph`
- `flowchart/db-acc-descr-empty-replaces`
- `flowchart/db-acc-descr-empty-block-keeps`
- `flowchart/db-acc-repeated`
- `flowchart/db-acc-descr-line-alone`
