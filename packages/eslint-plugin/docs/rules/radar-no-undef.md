# @mmd-toolkit/radar-no-undef

Japanese version: [radar-no-undef.ja.md](./radar-no-undef.ja.md)

Disallow an entry of a curve that names no axis.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

An entry of a curve written with an axis, as `A: 1`, gives the value of that
axis. When no `axis` statement declares the name, mermaid.js drops the entry
without an error, and its value is lost.

## Rule Details

This rule applies to radar charts (`radar-beta`). It reports a curve entry whose
axis name no `axis` statement in the diagram declares. Names are compared with
their case, and an axis is named by its id, so `North: 1` does not name
`axis A["North"]`. An axis declared after the curve counts.

A curve missing an entry for a declared axis is not reported, because mermaid.js
gives an error for it.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-undef: error
radar-beta
  axis A, B, C
  curve sales{A: 1, B: 2, C: 3, D: 9}
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-undef: error
radar-beta
  axis A, B, C
  curve sales{C: 3, A: 1, B: 2}
```

## Options

This rule has no options.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/radar-no-undef.ts)
- [Tests source](../../tests/rules/radar-no-undef.test.ts)

<!-- end auto-generated rule resources -->
