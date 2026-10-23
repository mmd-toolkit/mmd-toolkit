# @mmd-toolkit/block-no-duplicate-columns

Japanese version:
[block-no-duplicate-columns.ja.md](./block-no-duplicate-columns.ja.md)

Disallow a `columns` statement that changes the count of its block.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`columns` sets the number of columns of the diagram or of a composite block.
mermaid.js accepts a second `columns` in the same block without an error, and
the last one sets the count for the whole block, also for the blocks written
before it: after `columns 2`, `A B`, `columns 3`, and `C`, all three blocks are
in one row of three columns.

## Rule Details

This rule reports a `columns` statement after the first one of its block, when
it sets a count other than the one before it. It applies to `block`.

The diagram and each composite block have their own count, and a statement after
`end` belongs to the block around it again. Counts are compared as numbers, so
`columns 02` after `columns 2` sets the same count and is not reported, while
`auto` is another count than any number, `0` included. After `columns 2` and
`columns 3`, a third `columns 2` is reported, because it replaces `3`.

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
