# @mmd-toolkit/block-no-duplicate-columns

Japanese version:
[block-no-duplicate-columns.ja.md](./block-no-duplicate-columns.ja.md)

Disallow a `columns` statement that changes the count of its block.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

`columns` sets the number of columns of the diagram or a composite block.
mermaid.js accepts another `columns` without an error and uses the last count
for the whole block, including blocks written before it. An earlier count does
not keep its part of the diagram in that layout.

## Rule Details

This rule applies to block diagrams (`block-beta` and `block`). It reports a
`columns` statement that changes the count set by the previous `columns` of the
same block. The diagram and each composite block have separate counts; after
`end`, statements belong to the enclosing block again.

Counts are compared as numbers, so `columns 02` after `columns 2` is not
reported. `auto` differs from every number, including `0`. After `columns 2` and
`columns 3`, another `columns 2` is reported because it replaces `3`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-duplicate-columns: error
block
  columns 2
  A B
  columns 3
  C
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-duplicate-columns: error
block
  columns 2
  block:G
    columns 3
    A
  end
  B
```

## Options

This rule has no options.

## Related Rules

- [block-no-duplicate-block](./block-no-duplicate-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/block-no-duplicate-columns.ts)
- [Tests source](../../tests/rules/block-no-duplicate-columns.test.ts)

<!-- end auto-generated rule resources -->
