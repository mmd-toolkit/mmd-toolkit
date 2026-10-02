# mmd/flowchart/no-empty-description-block

Japanese version:
[no-empty-description-block.ja.md](./no-empty-description-block.ja.md)

Notes for implementing the rule
[mmd/flowchart/no-empty-description-block](../../rules/flowchart/no-empty-description-block.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A `FlowchartAccDescrBlockStatement` whose `value` is null and whose `closed` is
true, when no comment of `Root.comments` lies in its range, from the `{` token
to the `}` token. A block that is not closed has no value either when the text
ends right after its `{`; that block is left to
[no-unclosed-description-block](../../rules/flowchart/no-unclosed-description-block.md).
An empty block that does not start a statement, as in `A accDescr {}`, is a
syntax error of the parser
([`tokenless-empty-forms`](../../../../spec/docs/known-divergences/tokenless-empty-forms.md)
in the specification's known divergences), so no tree holds it.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `flowchart/db-acc-descr-empty-block-keeps`
- `flowchart/db-acc-descr-empty-block-lines-keeps`
- `flowchart/db-acc-descr-empty-block-after-semicolon-keeps`
- `flowchart/db-acc-descr-empty-block-after-block`
- `flowchart/gram-acc-descr-block-empty`
- `flowchart/db-acc-descr-block-replaces`
- `flowchart/db-acc-descr-empty-replaces`
- `flowchart/db-acc-descr-block-comment-only-keeps`
- `flowchart/db-acc-descr-empty-block-alone`
- `flowchart/db-acc-descr-empty-block-spaces-alone`
- `flowchart/db-acc-descr-empty-block-lines-alone`
- `flowchart/db-acc-descr-block-alone`
- `flowchart/db-acc-descr-block-comment-only-alone`
