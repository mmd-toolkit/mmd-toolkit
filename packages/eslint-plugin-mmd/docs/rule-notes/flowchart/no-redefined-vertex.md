# mmd/flowchart/no-redefined-vertex

Japanese version: [no-redefined-vertex.ja.md](./no-redefined-vertex.ja.md)

Notes for implementing the rule
[mmd/flowchart/no-redefined-vertex](../../rules/flowchart/no-redefined-vertex.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

Two `FlowchartVertex` nodes whose `id` has the same `name`, both with a `shape`,
where the shapes differ in their `name` or in the `value` of their `label`. The
rule reports the later one. A shape or a label set by a data block, as in
`A@{ shape: rect }`, is not compared, because the tree does not read data
blocks.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `flowchart/db-vertex-label-redefined`
- `flowchart/db-vertex-label-kept-without-label`
- `flowchart/db-vertex-label-redefined-same`
