# @mmd-toolkit/block-no-duplicate-block

Japanese version:
[block-no-duplicate-block.ja.md](./block-no-duplicate-block.ja.md)

Disallow declaring a block again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

Each id names one block, and a block is placed where it is first declared.
mermaid.js accepts a second declaration of the same id without an error, but it
places no second block: `A B A` draws `A` once. A label or a shape written again
replaces those of the first declaration, while a width, the children of a
composite block, and its `columns` are lost.

## Rule Details

This rule reports a declaration of an id that an earlier statement declared. It
applies to `block`.

A block is declared by a block written on its own, as `A` or `A["Label"]:2`, by
the head of a composite block, as `block:G`, and by an edge, which declares its
two blocks. The ids are compared with their case, across composite blocks, and
`root`, the id of the diagram, is declared from the start. A block that a chain
or a composite head with a link loses is not declared.

A block written on its own or a composite head with an id that was declared
before is reported, since it places nothing: after `A --> B`, a line `A` places
nothing, and after `block:G`, its blocks, and `end`, a second `block:G` leaves
its blocks unplaced. The one exception gives a block its first shape: after
`A --> B`, the statement `B["Output"]` gives `B` its label and shape, and it is
not reported. A width with it, as in `B["Output"]:2`, is lost, and that
statement is reported. A block arrow is no such exception: a later declaration
gives the block the kind and the label of the arrow but none of its directions,
so after `A`, the statement `A<["Next"]>(down)` gives an arrow that points
nowhere, and it is reported.

A block in an edge that was declared before is the block itself, and it is
reported only where its shape differs from the shape that the block has: after
`A["First"]`, the edge `A["Second"] --> B` replaces the label `First`, while
`A["First"] --> B` is not reported. A block arrow in an edge for a block that
had no shape loses its directions in the same way and is reported. Shapes are
compared by their label and their kind, and block arrows also by their
directions, as the drawing uses them: `(x)` is the same as `(left, right)`.
After `A["x"]`, `A["y"] --> B`, and `A["x"] --> B`, both edges are reported.

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
