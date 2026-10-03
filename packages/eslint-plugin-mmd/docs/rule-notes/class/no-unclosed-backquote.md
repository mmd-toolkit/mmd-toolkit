# mmd/class/no-unclosed-backquote

Japanese version: [no-unclosed-backquote.ja.md](./no-unclosed-backquote.ja.md)

Notes for implementing the rule
[mmd/class/no-unclosed-backquote](../../rules/class/no-unclosed-backquote.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A `ClassName` whose `name` is a `StringLiteral` whose `closed` is false (the
`name` of a `ClassName` is a `ClassIdentifier` or a `StringLiteral`, and only
the `StringLiteral` has `closed`). A name of a single backquote, as in
``class ` ``, is not closed either.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `class/lex-backquote-unclosed-takes-lines`
- `class/lex-backquote-unclosed`
- `class/lex-backquote-unclosed-alone`
- `class/docs-syntax-class-diagram-01f18827`
