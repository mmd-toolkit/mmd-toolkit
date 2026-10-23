# @mmd-toolkit/block-no-invalid-direction

Japanese version:
[block-no-invalid-direction.ja.md](./block-no-invalid-direction.ja.md)

Disallow a direction of a block arrow that is not one of the direction words.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A block arrow points in the directions written after it, as in
`A<["Next"]>(right)`. The directions are `right`, `left`, `up`, and `down`, and
`x` and `y` for both directions of an axis. mermaid.js keeps a direction with
the whitespace written inside the parentheses or before a comma, as in
`( left )`, and the drawing does not read it, without an error: the arrow does
not point that way.

## Rule Details

This rule reports a direction of a block arrow that is not exactly one of
`right`, `left`, `up`, `down`, `x`, and `y`. It applies to `block`, to block
arrows written on their own and in edges.

Whitespace after a comma is not kept: `(x, down)`, as the documentation of
mermaid.js writes it, has the directions `x` and `down`, and it is not reported.
Whitespace before a comma is kept, so `(left ,right)` points right only, and its
first direction is reported. Write the directions without whitespace inside the
parentheses, as `(left, right)`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-invalid-direction: error
block
  A<["Next"]>( left )
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-invalid-direction: error
block
  A<["Next"]>(left)
```

```mmd
%% eslint @mmd-toolkit/block-no-invalid-direction: error
block
  A<["Next"]>(x, down)
```

## Options

This rule has no options.

## Related Rules

- [block-no-mismatched-shape](./block-no-mismatched-shape.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/block-no-invalid-direction.ts)
- [Tests source](../../tests/rules/block-no-invalid-direction.test.ts)

<!-- end auto-generated rule resources -->
