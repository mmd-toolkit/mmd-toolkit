# @mmd-toolkit/sequence-no-link-without-separator

Japanese version:
[sequence-no-link-without-separator.ja.md](./sequence-no-link-without-separator.ja.md)

Notes for implementing the rule
[@mmd-toolkit/sequence-no-link-without-separator](../rules/sequence-no-link-without-separator.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A `SequenceLinkStatement` whose text holds no `@`: its `text` is null, the
`value` of its `text` is null, or the `value` of that `SequenceLiteral` holds no
`@`. Looking for `@` in the value is a reading of the value, not a second lexing
of the text.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `sequence/db-link-without-at-url`
- `sequence/db-link-without-at`
- `sequence/db-link-label`
- `sequence/db-link-empty`
