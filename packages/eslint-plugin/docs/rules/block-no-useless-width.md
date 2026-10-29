# @mmd-toolkit/block-no-useless-width

Japanese version: [block-no-useless-width.ja.md](./block-no-useless-width.ja.md)

Disallow a width on the first block of an edge.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A width after a block, as in `A:2`, makes it span two columns. mermaid.js
accepts a width on the first block of an edge, as in `A:2 --> B`, without an
error but drops it. The block keeps its existing width or spans one column.

## Rule Details

This rule applies to block diagrams (`block-beta` and `block`). It reports a
width before an edge's link when it differs from the width that the block keeps:
the width of its first declaration, or one column when that declaration is an
edge or has no width.

After `A:2`, `A:2 --> B` repeats the width and is not reported, while
`A:3 --> B` and `A:1 --> B` are reported and leave the width at 2. Where the
block spans one column, `A:1 --> B` is not reported. Widths are compared as
numbers, so `A:02` is two columns.

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
