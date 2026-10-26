# @mmd-toolkit/radar-no-duplicate-entry

Japanese version:
[radar-no-duplicate-entry.ja.md](./radar-no-duplicate-entry.ja.md)

Disallow an entry of a curve that gives another value for an axis that an
earlier entry of the curve has.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A curve has one value for each axis. When a curve names an axis twice with other
values, mermaid.js uses the value of the first entry without an error, and the
later value is lost.

## Rule Details

This rule reports an entry of a curve that gives an axis another value than the
first entry of the same curve for that axis. It applies to `radar`.

After `A: 1, A: 9, A: 9, A: 1` in one curve, the curve has the value `1` for
`A`, and the two entries with `9` are reported: each entry is compared with the
first one, not with the one before it. Each curve has its own entries.

An entry that gives the value of the first one loses nothing and is not
reported. Values are compared as numbers: `1.0` and `01.00` are one value. An
entry whose name no axis declares is reported by
[radar-no-undef](./radar-no-undef.md) instead.

Give each axis one value in each curve.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-duplicate-entry: error
radar-beta
  axis A, B, C
  curve sales{A: 1, B: 2, C: 3, A: 9}
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-duplicate-entry: error
radar-beta
  axis A, B, C
  curve sales{A: 9, B: 2, C: 3}
```

## Options

This rule has no options.

## Related Rules

- [radar-no-undef](./radar-no-undef.md)

## Background

[`computeCurveEntries`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/radar/db.ts#L75-L91)
takes, for each declared axis, the first entry that names it.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/radar-no-duplicate-entry.ts)
- [Tests source](../../tests/rules/radar-no-duplicate-entry.test.ts)

<!-- end auto-generated rule resources -->
