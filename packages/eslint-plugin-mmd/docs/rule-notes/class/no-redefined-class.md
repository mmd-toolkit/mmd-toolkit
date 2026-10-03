# mmd/class/no-redefined-class

Japanese version: [no-redefined-class.ja.md](./no-redefined-class.ja.md)

Notes for implementing the rule
[mmd/class/no-redefined-class](../../rules/class/no-redefined-class.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

Two `ClassDeclaration` nodes with a `label` whose classes have the same id,
where the `value` of the labels differs. The rule reports the later one. The id
of a class is none of the fields of the class name (`prefix`, `name`, and
`generic`): it is the text of the class name, its prefix included, before its
first `~`, a derivation of the Db that the rule repeats (see Building the
summary from the tree in the tests package's docs/db-from-tree/class.md).

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `class/db-class-label-redefined`
- `class/db-class-label-kept-without-label`
- `class/db-class-members-added`
