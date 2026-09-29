# mmd/flowchart/no-empty-description-block

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
whitespace. It applies to `flowchart-v2`, `flowchart-elk`, and `swimlane`.

The description stays what it was before the block: after `accDescr: x`, the
block `accDescr { }` leaves the description `x`, and with no description before
it, the description stays empty. An empty description written as a line is
different: `accDescr:` sets the description to the empty text.

A block that holds only comments is not reported. The author who turns the lines
of a description into comments means the block to do nothing, and mermaid.js
reads it so: the description before the block stays.

Examples of **incorrect** code for this rule:

```mmd
flowchart LR
  A
  accDescr {}
```

```mmd
flowchart LR
  A
  accDescr { }
```

```mmd
flowchart LR
  A
  accDescr {
  }
```

Examples of **correct** code for this rule:

```mmd
flowchart LR
  A
  accDescr { y }
```

```mmd
flowchart LR
  A
  accDescr {
    %% c
  }
```

## Options

This rule has no options. An option to also report a block that holds only
comments will be considered only if users of the rule ask for it.

## Related Rules

- [no-unclosed-description-block](./no-unclosed-description-block.md)
- [no-duplicate-description](./no-duplicate-description.md)

## Implementation Notes

The rule is not implemented yet. These notes are for implementing it.

### How the tree shows it

A `FlowchartAccDescrBlockStatement` whose `value` is null and whose `closed` is
true, when no comment of `Root.comments` lies in its range, from the `{` token
to the `}` token. A block that is not closed has no value either when the text
ends right after its `{`; that block is left to
[no-unclosed-description-block](./no-unclosed-description-block.md). An empty
block that does not start a statement, as in `A accDescr {}`, is a syntax error
of the parser
([`tokenless-empty-forms`](../../../../spec/docs/known-divergences.md#tokenless-empty-forms)
in the specification's known divergences), so no tree holds it.

### Fixtures

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
