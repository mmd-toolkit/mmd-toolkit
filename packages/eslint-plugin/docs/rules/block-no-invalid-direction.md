# @mmd-toolkit/block-no-invalid-direction

Japanese version:
[block-no-invalid-direction.ja.md](./block-no-invalid-direction.ja.md)

Disallow a direction of a block arrow that is not one of the direction words.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

A block arrow points in the directions written after it, as in
`A<["Next"]>(right)`. mermaid.js accepts whitespace inside the parentheses or
before a comma, as in `( left )`, without an error. That whitespace remains part
of the direction, so the arrow does not point that way.

## Rule Details

This rule applies to block diagrams (`block-beta` and `block`). It reports a
direction that is not exactly `right`, `left`, `up`, `down`, `x`, or `y`, in
standalone block arrows and in edges.

Whitespace after a comma is ignored, so `(x, down)` is not reported. Whitespace
before a comma is kept, so the first direction in `(left ,right)` is reported
and the arrow points right only.

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
