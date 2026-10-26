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

This rule reports an entry of a curve whose axis name no `axis` statement of the
diagram declares. It applies to `radar`.

After `axis A, B, C`, the entry `D: 9` in `curve sales{A: 1, B: 2, C: 3, D: 9}`
gives no point, and the curve is drawn from `1`, `2`, and `3`.

Names are compared with their case, and an axis is named by its id, not by its
label: after `axis A["North"]`, an entry `North: 1` names no axis. An `axis`
statement after the curve declares the name too. A curve that lacks an entry for
a declared axis is rejected by mermaid.js.

Correct the name of the axis, or remove the entry.

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

## Background

[`computeCurveEntries`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/radar/db.ts#L75-L91)
takes, for each declared axis, the first entry that names it, and leaves the
other entries out.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/radar-no-undef.ts)
- [Tests source](../../tests/rules/radar-no-undef.test.ts)

<!-- end auto-generated rule resources -->
