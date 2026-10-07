# @mmd-toolkit/class-no-duplicate-title

Japanese version:
[class-no-duplicate-title.ja.md](./class-no-duplicate-title.ja.md)

Notes for implementing the rule
[@mmd-toolkit/class-no-duplicate-title](../rules/class-no-duplicate-title.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A `ClassAccTitleStatement` when another `ClassAccTitleStatement` comes before it
in the source. The statements are in the `body` of the `ClassDiagram`, in the
order of their ranges; the rule reports each one after the first.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `class/db-acc-title-replaces`
- `class/db-acc-title-spaces`
- `class/db-acc-title-line-empty-takes-next-lines`
- `class/lex-acc-title-at-end`
