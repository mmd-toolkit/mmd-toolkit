# mmd/sequence/no-create-destroy

Japanese version: [no-create-destroy.ja.md](./no-create-destroy.ja.md)

Notes for implementing the rule
[mmd/sequence/no-create-destroy](../../rules/sequence/no-create-destroy.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A `SequenceDestroyStatement` whose `created` is true.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `sequence/gram-create-destroy`
- `sequence/db-create-destroy-then-destroy`
- `sequence/db-create-participant-before-message`
