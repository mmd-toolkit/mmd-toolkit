# mmd/flowchart/no-style-unknown-id

Japanese version: [no-style-unknown-id.ja.md](./no-style-unknown-id.ja.md)

Notes for implementing the rule
[mmd/flowchart/no-style-unknown-id](../../rules/flowchart/no-style-unknown-id.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A `FlowchartStyleStatement` whose `id` has a `name` that the `id` of no
`FlowchartVertex` of the diagram has, before or after the statement, and that is
not the id of a subgraph.

The id of a subgraph is the difficulty. It is not a field of the tree:
mermaid.js derives it from the name, the title, and the source text after the
name, and generates ids such as `subGraph0` (see Db normalization in the
specification's diagrams/flowchart.md). The rule would have to repeat that
derivation, which the normalizer of `@mmd-toolkit/tests` also performs. Whether
the parser should offer the id of a subgraph is an open question.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `flowchart/db-style-unknown-vertex`
- `flowchart/db-style-before-vertex`
- `flowchart/db-style-subgraph-id`
