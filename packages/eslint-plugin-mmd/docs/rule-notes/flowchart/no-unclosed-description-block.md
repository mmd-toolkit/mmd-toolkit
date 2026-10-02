# mmd/flowchart/no-unclosed-description-block

Japanese version:
[no-unclosed-description-block.ja.md](./no-unclosed-description-block.ja.md)

Notes for implementing the rule
[mmd/flowchart/no-unclosed-description-block](../../rules/flowchart/no-unclosed-description-block.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A `FlowchartAccDescrBlockStatement` whose `closed` is false.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `flowchart/lex-acc-descr-block-unclosed`
- `flowchart/db-acc-descr-unclosed-replaces`
- `flowchart/db-acc-descr-block-alone`
