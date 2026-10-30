# @mmd-toolkit/block-no-duplicate-block

Japanese version:
[block-no-duplicate-block.ja.md](./block-no-duplicate-block.ja.md)

Disallow declaring a block again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

Each id names one block, placed where it is first declared. mermaid.js accepts
another declaration without an error, but places no second block. A later label
or shape replaces the earlier one, while a width, the children of a composite
block, and its `columns` are lost.

## Rule Details

This rule applies to block diagrams (`block-beta` and `block`). It reports a
repeated block declaration written on its own or as the head of a composite
block. Blocks are declared by standalone declarations, composite heads, and
edges, across composite blocks; ids are case-sensitive, and `root` is declared
from the start. A block lost by an edge chain or a composite head with a link is
not declared.

A declaration that gives a block its first shape is not reported, as in
`B["Output"]` after `A --> B`. Adding a width there is reported because the
width is lost. A block arrow is no such exception: when it gives a block its
first shape, on its own or in an edge, it is reported because its directions are
lost.

In an edge, a previously declared block is reported only when its shape differs
from the shape the block currently has. Shapes are compared by label and kind,
and block arrows also by their directions as drawn: `(x)` is the same as
`(left, right)`. After `A["x"]`, both `A["y"] --> B` and a following
`A["x"] --> B` are reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-duplicate-block: error
block
  columns 2
  A B
  A
```

```mmd
%% eslint @mmd-toolkit/block-no-duplicate-block: error
block
  A["First"]
  A["Second"]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-duplicate-block: error
block
  A --> B
  B["Output"]
```

```mmd
%% eslint @mmd-toolkit/block-no-duplicate-block: error
block
  A["First"]
  A["First"] --> B
```

## Options

This rule has no options.

## Related Rules

- [block-no-useless-width](./block-no-useless-width.md)
- [block-no-undef](./block-no-undef.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/block-no-duplicate-block.ts)
- [Tests source](../../tests/rules/block-no-duplicate-block.test.ts)

<!-- end auto-generated rule resources -->
