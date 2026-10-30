# @mmd-toolkit/block-no-mismatched-shape

Japanese version:
[block-no-mismatched-shape.ja.md](./block-no-mismatched-shape.ja.md)

Disallow a shape whose closing does not match its opening.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A block's opening and closing together specify its shape, as in `A["x"]` and
`A(("x"))`. mermaid.js accepts a mismatched pair, such as `A["x")`, without an
error. It keeps the label but draws a plain rectangle instead of the intended
shape.

## Rule Details

This rule applies to block diagrams (`block-beta` and `block`). It reports a
shape whose opening is known to mermaid.js but whose opening and closing do not
form a recognized pair, in standalone blocks and in edges.

Missing or extra brackets, as in `A(("x")` and `A["x"]]`, are reported. The
asymmetric pairs `A>"x"]`, `A[/"x"\]`, and `A[\"x"/]` are not reported because
they specify shapes. Composite heads are not checked because they are drawn as
composite blocks regardless of the pair.

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
