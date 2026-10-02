# mmd/sequence/no-ignored-text

Japanese version: [no-ignored-text.ja.md](./no-ignored-text.ja.md)

Notes for implementing the rule
[mmd/sequence/no-ignored-text](../../rules/sequence/no-ignored-text.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A `SequenceIgnoredStatement`.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `sequence/db-ignored-line-after-wrapped-message`
- `sequence/db-wrapped-message-closed`
- `sequence/lex-invalid-line-parenthesis`
- `sequence/lex-invalid-line-slash`
- `sequence/lex-invalid-line-two-units`
