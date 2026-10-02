# mmd/class/no-bare-class-name

Japanese version: [no-bare-class-name.ja.md](./no-bare-class-name.ja.md)

Notes for implementing the rule
[mmd/class/no-bare-class-name](../../rules/class/no-bare-class-name.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A `ClassNameStatement`.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `class/lex-direction-lower-case`
- `class/gram-title-not-statement`
- `class/gram-name-alone`
- `class/spec-class-diagram-b33b8303`
- `class/db-class-declaration-alone`
