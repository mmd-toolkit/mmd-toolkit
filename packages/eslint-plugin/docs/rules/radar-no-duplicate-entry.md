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

This rule applies to radar charts (`radar-beta`). It reports a curve entry that
gives a declared axis a different value from the first entry for that axis in
the same curve. Each entry is compared with the first one, and each curve is
checked separately. An entry repeating the first value is not reported.

Values are compared as numbers, so `1.0` and `01.00` are the same value. An
entry naming no declared axis is reported by
[radar-no-undef](./radar-no-undef.md) instead.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/radar-no-duplicate-entry.ts)
- [Tests source](../../tests/rules/radar-no-duplicate-entry.test.ts)

<!-- end auto-generated rule resources -->
