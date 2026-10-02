# mmd/flowchart/no-unclosed-description-block

Japanese version:
[no-unclosed-description-block.ja.md](./no-unclosed-description-block.ja.md)

Disallow an `accDescr {` block without its closing `}`.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

mermaid.js accepts a description block that is never closed. The rest of the
diagram is read as the text of the block, and the description is empty, whatever
the block holds.

## Rule Details

This rule reports an `accDescr {` block that is not closed by `}`. It applies to
`flowchart-v2`, `flowchart-elk`, and `swimlane`.

A description written before the block is replaced by the empty one.

Examples of **incorrect** code for this rule:

```mmd
flowchart LR
  A
  accDescr { x
```

Examples of **correct** code for this rule:

```mmd
flowchart LR
  A
  accDescr { y }
```

## Options

This rule has no options.

## Related Rules

- [no-empty-description-block](./no-empty-description-block.md)
- [no-duplicate-description](./no-duplicate-description.md)
