# @mmd-toolkit/sequence-no-empty-description-block

Japanese version:
[sequence-no-empty-description-block.ja.md](./sequence-no-empty-description-block.ja.md)

Notes for implementing the rule
[@mmd-toolkit/sequence-no-empty-description-block](../rules/sequence-no-empty-description-block.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A `SequenceAccDescrBlockStatement` whose `value` is null and whose `closed` is
true, when no comment of `Root.comments` lies in its range, from the `{` token
to the `}` token. Such a statement also stands in the `body` of a
`SequenceBoxStatement`, where a statement starts, as in `box G`, a line break,
`accDescr {}`, and after the last part of a statement or after the header on the
same line, as in `autonumber accDescr {}` or `sequenceDiagram accDescr {}`; it
changes nothing in any of these places (checked by inserting the block at the
end of every line of the accepted sequence fixtures: 646 blocks, none of them
changed the Db).

The suggestion to remove the block is offered only when the block is the first
token on its line; it removes the block with the whitespace after it, or the
line when nothing else is on it, and never a `;` after it (13,004 such blocks
from the fixtures, none read differently after the removal). After something on
its line, as in `autonumber accDescr {}`, removing the whitespace before the
block changes what `autonumber ` means, so no suggestion is offered there.

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
- `sequence/db-empty-description-block-with-directive-wrap`
