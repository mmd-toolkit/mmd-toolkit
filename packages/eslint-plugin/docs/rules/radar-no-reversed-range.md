# @mmd-toolkit/radar-no-reversed-range

Japanese version:
[radar-no-reversed-range.ja.md](./radar-no-reversed-range.ja.md)

Disallow a `min` above the `max` of a diagram.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`min` and `max` set the values at the center and at the outer ring. When the
minimum is above the maximum, mermaid.js accepts them without an error and draws
every point of every curve on the outer ring, whatever its value: the values of
the curves are lost.

## Rule Details

This rule reports the later of the last `min` and the last `max` of a diagram
when the minimum is above the maximum and the diagram has a curve that is drawn.
It applies to `radar`.

After `min 10, max 5`, the curves `{1, 2, 3}` and `{8, 4, 2}` are drawn alike,
with every point on the outer ring. A later `min 0` or `max 20` that makes the
range increase is not reported.

A diagram without `max` is not reported: mermaid.js then takes the largest value
of the curves as the maximum, which the rule does not compute, so after `min 10`
with values up to 3 and no `max`, the points are on the outer ring and the rule
reports nothing. A diagram with no curve that is drawn, as a curve of values
whose count differs from the count of the axes, is not reported either. A
minimum equal to the maximum is not reported, and neither is a range that cuts
off values outside it, as `min 2, max 8` with the value 9.

Write a `min` below the `max`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-reversed-range: error
radar-beta
  axis A, B, C
  curve sales{1, 2, 3}
  min 10, max 5
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-reversed-range: error
radar-beta
  axis A, B, C
  curve sales{1, 2, 3}
  min 0, max 5
```

## Options

This rule has no options.

## Background

[`relativeRadius`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/radar/renderer.ts#L175-L184)
first bounds a value by the minimum and then by the maximum, so with the minimum
above the maximum every value becomes the maximum, at the outer ring.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/radar-no-reversed-range.ts)
- [Tests source](../../tests/rules/radar-no-reversed-range.test.ts)

<!-- end auto-generated rule resources -->
