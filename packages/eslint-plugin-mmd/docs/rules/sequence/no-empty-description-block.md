# mmd/sequence/no-empty-description-block

Japanese version:
[no-empty-description-block.ja.md](./no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A description block is written to give the diagram its description. When the
block holds nothing, or only whitespace, mermaid.js accepts it and does nothing
with it, so the block has no effect.

## Rule Details

This rule reports a closed `accDescr` block that holds nothing or only
whitespace. It applies to `sequence`.

The description stays what it was before the block: after `accDescr: x`, the
block `accDescr {}` leaves the description `x`, and with no description before
it, the description stays empty. An empty description written as a line is
different: `accDescr:` sets the description to the empty text.

A block that holds only comments is not reported. The author who turns the lines
of a description into comments means the block to do nothing, and mermaid.js
reads it so: the description before the block stays.

Examples of **incorrect** code for this rule:

```mmd
sequenceDiagram
  A ->> B: x
  accDescr {}
```

```mmd
sequenceDiagram
  A ->> B: x
  accDescr { }
```

```mmd
sequenceDiagram
  A ->> B: x
  accDescr {
  }
```

Examples of **correct** code for this rule:

```mmd
sequenceDiagram
  A ->> B: x
  accDescr { y }
```

```mmd
sequenceDiagram
  A ->> B: x
  accDescr {
    %% c
  }
```

## Options

This rule has no options. An option to also report a block that holds only
comments will be considered only if users of the rule ask for it.

## Related Rules

- [flowchart/no-empty-description-block](../flowchart/no-empty-description-block.md)
- [no-duplicate-description](./no-duplicate-description.md)

## Implementation Notes

The rule is not implemented yet. These notes are for implementing it.

### How the tree shows it

A `SequenceAccDescrBlockStatement` whose `value` is null and whose `closed` is
true, when no comment of `Root.comments` lies in its range, from the `{` token
to the `}` token. An empty block that does not start a statement is a syntax
error of the parser
([`tokenless-empty-forms`](../../../../spec/docs/known-divergences.md#tokenless-empty-forms)
in the specification's known divergences), so no tree holds it.

### Fixtures

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
