# @mmd-toolkit/block-no-mismatched-shape

Japanese version:
[block-no-mismatched-shape.ja.md](./block-no-mismatched-shape.ja.md)

Disallow a shape whose closing does not match its opening.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

The shape of a block is given by its opening and its closing together, as
`A["x"]` for a square and `A(("x"))` for a circle. mermaid.js accepts an opening
with another closing, as in `A["x")`, without an error, and keeps the label, but
the block gets no shape and is drawn as a plain rectangle.

## Rule Details

This rule reports a shape whose opening is one that mermaid.js knows and whose
opening and closing together give no shape. It applies to `block`, to blocks
written on their own and to the blocks of an edge.

A missing parenthesis, as in `A(("x")`, and one bracket too many, as in
`A["x"]]`, are reported. The pairs that the documentation of mermaid.js gives
with different sides, `A>"x"]` and the two trapezoids `A[/"x"\]` and `A[\"x"/]`,
are not reported. The head of a composite block is not checked, since it is
drawn as a composite block whatever its pair.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-mismatched-shape: error
block
  A["Start")
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-mismatched-shape: error
block
  A["Start"]
```

## Options

This rule has no options.

## Related Rules

- [block-no-mismatched-edge](./block-no-mismatched-edge.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/block-no-mismatched-shape.ts)
- [Tests source](../../tests/rules/block-no-mismatched-shape.test.ts)

<!-- end auto-generated rule resources -->
