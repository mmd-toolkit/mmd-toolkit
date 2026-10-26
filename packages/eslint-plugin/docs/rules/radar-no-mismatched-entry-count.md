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

This rule reports a curve whose values have no axis names and whose count
differs from the count of the axes of the diagram. It applies to `radar`.

After `axis A, B, C`, both `curve sales{1, 2}` and `curve sales{1, 2, 3, 4}` are
left out of the drawing; no part of them is drawn. A curve of values in a
diagram with no axes is reported too.

Every axis of the diagram counts, also one declared after the curve and one of a
name declared before. Each curve of a `curve` statement with several curves is
checked on its own. A curve with axis names, as `curve sales{A: 1, B: 2, C: 3}`,
is not reported: an entry that names no axis is reported by
[radar-no-undef](./radar-no-undef.md), and a missing one is rejected by
mermaid.js.

Give the curve one value for each axis.

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

## Background

[`drawCurves`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/radar/renderer.ts#L135-L173)
skips a curve whose count of values is not the count of the axes.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/radar-no-mismatched-entry-count.ts)
- [Tests source](../../tests/rules/radar-no-mismatched-entry-count.test.ts)

<!-- end auto-generated rule resources -->
