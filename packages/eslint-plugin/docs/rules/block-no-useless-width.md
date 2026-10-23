# @mmd-toolkit/block-no-useless-width

Japanese version: [block-no-useless-width.ja.md](./block-no-useless-width.ja.md)

Disallow a width on the first block of an edge.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A width after a block, as in `A:2`, makes the block span two columns. mermaid.js
also accepts a width on the first block of an edge, as in `A:2 --> B`, without
an error, but it drops it with the link: the block keeps the width it has, or
one column.

## Rule Details

This rule reports the width before the link of an edge when it differs from the
width that the block has: the width of its first declaration, or one column. It
applies to `block`.

After `A:2`, the edge `A:2 --> B` repeats the width and is not reported, while
`A:3 --> B` is reported and leaves the width 2. `A:1 --> B` gives the width that
the block has anyway and is not reported. Widths are compared as numbers, so
`A:02` is two columns. To give the block a width, write it where the block is
declared on its own, as `A:2`, before the edge.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-useless-width: error
block
  A:2 --> B
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-useless-width: error
block
  columns 3
  A:2 B
  A --> B
```

## Options

This rule has no options.

## Related Rules

- [block-no-duplicate-block](./block-no-duplicate-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/block-no-useless-width.ts)
- [Tests source](../../tests/rules/block-no-useless-width.test.ts)

<!-- end auto-generated rule resources -->
