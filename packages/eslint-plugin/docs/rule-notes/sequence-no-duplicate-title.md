# @mmd-toolkit/sequence-no-duplicate-title

Japanese version:
[sequence-no-duplicate-title.ja.md](./sequence-no-duplicate-title.ja.md)

Notes for implementing the rule
[@mmd-toolkit/sequence-no-duplicate-title](../rules/sequence-no-duplicate-title.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A `SequenceTitleStatement` when another `SequenceTitleStatement` comes before it
in the source, and a `SequenceAccTitleStatement`, also one whose `value` is
null, when another `SequenceAccTitleStatement` comes before it. The statements
are taken from the `body` of the `SequenceDiagram` and of every block and
section in it, in the order of their ranges; the rule reports each one after the
first of its type.

A `title` statement after a title in the frontmatter is not reported: reporting
it would need the rule to read the YAML of the frontmatter, which the parser
keeps as written. Whether it should be reported is an open question.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `sequence/db-title-replaces`
- `sequence/db-acc-title-replaces`
- `sequence/db-title-and-acc-title`
- `sequence/db-title-replaces-frontmatter`
- `sequence/db-title-legacy`
