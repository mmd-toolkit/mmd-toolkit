# @mmd-toolkit/radar-no-duplicate-option

Japanese version:
[radar-no-duplicate-option.ja.md](./radar-no-duplicate-option.ja.md)

Disallow an option that replaces the value of the same option before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`showLegend`, `ticks`, `min`, `max`, and `graticule` each hold one value. When a
diagram gives one of them twice, mermaid.js uses the later value without an
error, and the earlier one is lost.

## Rule Details

This rule reports an option that gives another value than the same option before
it in the diagram, in the same statement or in another one. It applies to
`radar`.

After `ticks 2, ticks 3, ticks 2`, the diagram draws 2 rings, and the second and
the third are reported: each replaces the value before it.

An option that gives the value that the diagram already has is not reported.
Numbers are compared as numbers: `ticks 3` and `ticks 03.00` are one value.
mermaid.js draws at most 32 rings, so a count of `ticks` above 32 is compared as
32: after `ticks 33`, `ticks 34` is not reported, and `ticks 3` is.

Give each option one value.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-duplicate-option: error
radar-beta
  axis A, B, C
  curve sales{1, 2, 3}
  ticks 2, ticks 3, ticks 2
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-duplicate-option: error
radar-beta
  axis A, B, C
  curve sales{1, 2, 3}
  showLegend true, ticks 3, min 0, max 5, graticule circle
```

## Options

This rule has no options.

## Background

[`setOptions`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/radar/db.ts#L93-L117)
keeps the last value of each option and draws at most 32 rings.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/radar-no-duplicate-option.ts)
- [Tests source](../../tests/rules/radar-no-duplicate-option.test.ts)

<!-- end auto-generated rule resources -->
