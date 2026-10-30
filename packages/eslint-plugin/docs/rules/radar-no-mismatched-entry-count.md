# @mmd-toolkit/radar-no-mismatched-entry-count

Japanese version:
[radar-no-mismatched-entry-count.ja.md](./radar-no-mismatched-entry-count.ja.md)

Disallow a curve of values without axes whose count differs from the count of
the axes.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A curve written with values only, as `curve sales{1, 2, 3}`, gives them to the
axes in order. When the curve has more or fewer values than the diagram has
axes, mermaid.js accepts it without an error and does not draw the curve at all:
only its entry in the legend is left.

## Rule Details

This rule applies to radar charts (`radar-beta`). It reports a curve whose
values have no axis names and whose count differs from the diagram's axis count,
including a curve in a diagram with no axes. Every axis counts, including one
declared after the curve and a repeated axis name. Each curve in a statement
containing several curves is checked separately.

A curve with axis names is not reported: an entry naming no axis is reported by
[radar-no-undef](./radar-no-undef.md), and mermaid.js gives an error for a curve
missing an entry for an axis.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-mismatched-entry-count: error
radar-beta
  axis A, B, C
  curve sales{1, 2}
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-mismatched-entry-count: error
radar-beta
  axis A, B, C
  curve sales{1, 2, 3}
```

## Options

This rule has no options.

## Related Rules

- [radar-no-undef](./radar-no-undef.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/radar-no-mismatched-entry-count.ts)
- [Tests source](../../tests/rules/radar-no-mismatched-entry-count.test.ts)

<!-- end auto-generated rule resources -->
