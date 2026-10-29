# @mmd-toolkit/block-no-mismatched-edge

Japanese version:
[block-no-mismatched-edge.ja.md](./block-no-mismatched-edge.ja.md)

Disallow an edge with a label whose two arrows do not match.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

An edge with a label has an arrow on each side of the label, as in
`A -- "x" --> B`. mermaid.js uses only the arrow after the label to draw the
line and arrowheads. It gives no error when a different line or an arrowhead
written before the label is lost.

## Rule Details

This rule applies to block diagrams (`block-beta` and `block`). It reports a
labeled edge when the arrow before the label has a different line from the arrow
after it, or a starting arrowhead that the later arrow does not have. An edge
with both mistakes is reported once.

The lines are solid (`--`), thick (`==`), and dotted (`-.`); a longer arrow has
the same line. `A -- "x" <--> B` is not reported because the arrow after the
label specifies both arrowheads.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-mismatched-edge: error
block
  A -- "x" ==> B
```

```mmd
%% eslint @mmd-toolkit/block-no-mismatched-edge: error
block
  A <-- "x" --> B
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-mismatched-edge: error
block
  A == "x" ==> B
```

```mmd
%% eslint @mmd-toolkit/block-no-mismatched-edge: error
block
  A -- "x" <--> B
```

## Options

This rule has no options.

## Related Rules

- [block-no-mismatched-shape](./block-no-mismatched-shape.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/block-no-mismatched-edge.ts)
- [Tests source](../../tests/rules/block-no-mismatched-edge.test.ts)

<!-- end auto-generated rule resources -->
