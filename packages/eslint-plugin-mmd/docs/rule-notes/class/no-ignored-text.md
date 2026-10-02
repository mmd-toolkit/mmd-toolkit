# mmd/class/no-ignored-text

Japanese version: [no-ignored-text.ja.md](./no-ignored-text.ja.md)

Notes for implementing the rule
[mmd/class/no-ignored-text](../../rules/class/no-ignored-text.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A `ClassIgnoredText`, except the `textAfter` of a `ClassDirectionStatement`
whose `value` starts with `%%`. The text before `direction` is the `textBefore`
of the `ClassDirectionStatement`, the text after its value is its `textAfter`,
and the parts of a method line are the `textBefore` and `textAfter` of the
`ClassMethod`. Looking at the start of the value is a reading of the value, not
a second lexing of the text. Text after the direction value that starts with
`%%` is no comment of `Root.comments`: it is the `textAfter`.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `class/lex-direction-line-class-statement`
- `class/lex-direction-line-value-then-text`
- `class/lex-direction-line-in-label`
- `class/lex-direction-line-in-note`
- `class/spec-class-diagram-b33b8303`
- `class/lex-member-method-line-separator-before`
- `class/lex-member-method-line-separator-after`
- `class/db-direction-then-comment`
