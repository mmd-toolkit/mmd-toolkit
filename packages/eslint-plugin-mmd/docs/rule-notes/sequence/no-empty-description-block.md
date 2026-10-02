# mmd/sequence/no-empty-description-block

Japanese version:
[no-empty-description-block.ja.md](./no-empty-description-block.ja.md)

Notes for implementing the rule
[mmd/sequence/no-empty-description-block](../../rules/sequence/no-empty-description-block.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A `SequenceAccDescrBlockStatement` whose `value` is null and whose `closed` is
true, when no comment of `Root.comments` lies in its range, from the `{` token
to the `}` token. An empty block that does not start a statement is a syntax
error of the parser
([`tokenless-empty-forms`](../../../../spec/docs/known-divergences/tokenless-empty-forms.md)
in the specification's known divergences), so no tree holds it. Such a statement
also stands in the `body` of a `SequenceBoxStatement`, where a statement starts,
as in `box G`, a line break, `accDescr {}`; it changes nothing there either.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `sequence/db-acc-descr-empty-block-after-message`
- `sequence/db-acc-descr-empty-block-spaces-after-message`
- `sequence/db-acc-descr-empty-block-lines-after-message`
- `sequence/db-acc-descr-block-after-message`
- `sequence/db-acc-descr-block-comment-only-after-message`
- `sequence/db-acc-descr-empty-block-keeps`
- `sequence/gram-acc-descr-block-empty-then-statement`
- `sequence/db-acc-descr-spaces-block-keeps`
- `sequence/db-acc-descr-comment-block-keeps`
- `sequence/gram-box-empty-description-block-line`
- `sequence/gram-box-empty-description-block-then-participant`
- `sequence/gram-box-empty-description-block-before-end`
- `sequence/gram-box-empty-description-block-lines`
