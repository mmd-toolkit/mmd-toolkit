# @mmd-toolkit/treemap-no-invalid-value

Japanese version:
[treemap-no-invalid-value.ja.md](./treemap-no-invalid-value.ja.md)

Disallow a value of a leaf that mermaid.js reads as another number.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js removes the commas of the value of a leaf and reads a number from its
start, without an error: the rest of the value is dropped, a comma meant as the
decimal point is lost with the others, and the leaf gets another value than the
one written.

## Rule Details

This rule reports the value of a leaf that holds `_` or more than one `.` after
its commas are removed, or holds no digit. It also reports a value with a comma
where no way of writing thousands puts one: after the `.` with a digit after it,
or with other than three digits after the last comma that a digit follows. It
applies to `treemap`.

`1_000` is read as 1, `1.2.3` as 1.2, and `.` as no number, which gives the leaf
no area and no value text. Commas are removed wherever they stand, so a decimal
comma is lost: `0,5` is read as 5, `3,14` as 314, and `1.234,5` as 1.2345.

A value that mermaid.js reads whole is not reported: `1000`, `.5`, `5.`, and 0.
Commas between groups of thousands are not reported, as in `1,000`, `1,234.5`,
and `1,00,000`, and neither is a comma that no digit follows, which separates
nothing, as in `5,` and `1.5,`. A decimal comma before three digits, as `0,125`,
is read as 125, and the rule does not report it, since it is written as
thousands are.

Write the number with digits, one `.`, and commas between groups of thousands.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/treemap-no-invalid-value: error
treemap
  "Revenue": 1_000
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/treemap-no-invalid-value: error
treemap
  "Revenue": 1,000
```

## Options

This rule has no options.

## Background

The
[value converter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/treemap/valueConverter.ts#L13-L15)
removes the commas of a number and reads the rest with the `parseFloat` of
JavaScript, which stops at the first character that does not continue a number.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/treemap-no-invalid-value.ts)
- [Tests source](../../tests/rules/treemap-no-invalid-value.test.ts)

<!-- end auto-generated rule resources -->
