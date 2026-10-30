# @mmd-toolkit/radar-no-reversed-range

Japanese version:
[radar-no-reversed-range.ja.md](./radar-no-reversed-range.ja.md)

Disallow a `min` above the `max` of a diagram.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

`min` and `max` set the values at the center and at the outer ring. When the
minimum is above the maximum, mermaid.js accepts them without an error and draws
every point of every curve on the outer ring, whatever its value: the values of
the curves are lost.

## Rule Details

This rule applies to radar charts (`radar-beta`). It reports the later of the
last `min` and the last `max` when the minimum is above the maximum and the
diagram has a curve that is drawn. Only the last `min` and the last `max` are
compared, so a later `min 0` or `max 20` after `min 10, max 5` leaves nothing
reported.

A diagram without `max` is not reported, because mermaid.js uses the largest
curve value as the maximum, which the rule does not compute. A diagram in which
mermaid.js draws no curve is not reported either, such as one with no axes, or
one whose curves of values all have a count different from the count of the
axes. A minimum equal to the maximum is not reported, nor is a range that cuts
off values outside it, such as `min 2, max 8` with a value of 9.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/radar-no-reversed-range.ts)
- [Tests source](../../tests/rules/radar-no-reversed-range.test.ts)

<!-- end auto-generated rule resources -->
