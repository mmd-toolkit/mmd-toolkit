# @mmd-toolkit/wardley-no-duplicate-annotations

Japanese version:
[wardley-no-duplicate-annotations.ja.md](./wardley-no-duplicate-annotations.ja.md)

Disallow an `annotations` after the first that gives the box of the annotations
another position.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A map has one box of annotations, at the position of its first `annotations`.
mermaid.js leaves a later `annotations` out without an error, so the position
that it gives has no effect.

## Rule Details

This rule applies to Wardley maps (`wardley-beta`). It reports a later
`annotations` giving a different position from the first when the map has an
annotation with text to show in the box. Each later statement is compared with
the first. An `annotations` giving the position of the first, or one in a map
with no annotation text, is not reported.

Positions are compared as percentages, so `0.1` and `10` are the same position.
mermaid.js moves a box that runs over the map's edge inside it, so two positions
near the edge may produce the same box and still be reported as different.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-annotations: error
wardley-beta
  annotations [0.1, 0.2]
  annotations [0.3, 0.4]
  annotation 1, [0.6, 0.7] "Review"
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-annotations: error
wardley-beta
  annotations [0.1, 0.2]
  annotation 1, [0.6, 0.7] "Review"
```

## Options

This rule has no options.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-duplicate-annotations.ts)
- [Tests source](../../tests/rules/wardley-no-duplicate-annotations.test.ts)

<!-- end auto-generated rule resources -->
