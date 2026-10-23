# @mmd-toolkit/block-no-mismatched-edge

Japanese version:
[block-no-mismatched-edge.ja.md](./block-no-mismatched-edge.ja.md)

Disallow an edge with a label whose two arrows do not match.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

An edge with a label is written with an arrow on each side of the label, as in
`A -- "x" --> B`. mermaid.js takes the line and the markers of the edge from the
arrow after the label only: `A -- "x" ==> B` draws a thick line, and in
`A <-- "x" --> B` the arrowhead at `A` is lost, without an error.

## Rule Details

This rule reports an edge with a label whose arrow before the label has another
line than the arrow after it, or has an arrowhead at its start that the arrow
after it does not have. It applies to `block`.

The lines are solid (`--`), thick (`==`), and dotted (`-.`); a longer arrow has
the same line. To draw an arrowhead at both ends, write it on the arrow after
the label, as in `A -- "x" <--> B`, which is not reported. An edge with both
mistakes is reported once.

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
