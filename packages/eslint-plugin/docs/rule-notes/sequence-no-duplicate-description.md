# @mmd-toolkit/sequence-no-duplicate-description

Japanese version:
[sequence-no-duplicate-description.ja.md](./sequence-no-duplicate-description.ja.md)

Notes for implementing the rule
[@mmd-toolkit/sequence-no-duplicate-description](../rules/sequence-no-duplicate-description.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A statement that sets the description, when another statement that sets the
description comes before it in the source. A statement that sets the description
is a `SequenceAccDescrStatement`, also one whose `value` is null, or a
`SequenceAccDescrBlockStatement` whose `closed` is true and whose `value` is not
null. The statements are taken from the `body` of the `SequenceDiagram` and of
every block and section in it, in the order of their ranges; the rule reports
each one after the first.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `sequence/db-acc-descr-replaces`
- `sequence/db-acc-descr-line-replaces-block`
- `sequence/db-acc-descr-outer-replaces-loop`
- `sequence/db-acc-descr-line-alone`
- `sequence/db-acc-descr-empty-block-keeps`
- `sequence/db-acc-descr-line-empty-takes-next-lines`
