# @mmd-toolkit/radar-no-duplicate-option

Japanese version:
[radar-no-duplicate-option.ja.md](./radar-no-duplicate-option.ja.md)

Disallow an option that replaces the value of the same option before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

`showLegend`, `ticks`, `min`, `max`, and `graticule` each hold one value. When a
diagram gives one of them twice, mermaid.js uses the later value without an
error, and the earlier one is lost.

## Rule Details

This rule applies to radar charts (`radar-beta`). It reports an option that
gives another value than the same option before it, in the same statement or in
another one. An option that repeats the value that the diagram already has is
not reported.

Numbers are compared as numbers, so `ticks 03.00` repeats `ticks 3`. mermaid.js
draws at most 32 rings, so after `ticks 33`, `ticks 34` is not reported, while
`ticks 3` is.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/radar-no-duplicate-option.ts)
- [Tests source](../../tests/rules/radar-no-duplicate-option.test.ts)

<!-- end auto-generated rule resources -->
