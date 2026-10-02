# mmd/class/no-duplicate-description

Japanese version:
[no-duplicate-description.ja.md](./no-duplicate-description.ja.md)

Notes for implementing the rule
[mmd/class/no-duplicate-description](../../rules/class/no-duplicate-description.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A statement that sets the description, when another statement that sets the
description comes before it in the source. A statement that sets the description
is a `ClassAccDescrStatement`, or a `ClassAccDescrBlockStatement` whose `value`
is not null. The statements are in the `body` of the `ClassDiagram`, in the
order of their ranges; the rule reports each one after the first.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `class/db-acc-descr-replaces`
- `class/db-acc-descr-line-replaces-block`
- `class/db-acc-title-spaces`
