# @mmd-toolkit/treemap-no-invalid-value

Japanese version:
[treemap-no-invalid-value.ja.md](./treemap-no-invalid-value.ja.md)

Disallow a value of a leaf that mermaid.js reads as another number.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

mermaid.js removes the commas of the value of a leaf and reads a number from its
start, without an error: the rest of the value is dropped, a comma meant as the
decimal point is lost with the others, and the leaf gets another value than the
one written.

## Rule Details

This rule applies to treemaps (`treemap` and `treemap-beta`). It reports a leaf
value that, after removing commas, contains `_`, more than one `.`, or no digit.
It also reports a value with a comma after the `.` that has a digit after it, as
in `1.5,5`, and a value whose last such comma before the `.` is followed by
other than three digits, as in `1,00`.

Whole numbers and decimals such as `1000`, `.5`, `5.`, and 0 are not reported.
Thousands separators such as `1,000`, `1,234.5`, and `1,00,000` are not
reported, nor are commas with no digit following, such as `5,` and `1.5,`. A
decimal comma before three digits, as in `0,125`, is read as 125 but is not
reported, because it has the form of a thousands separator.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/treemap-no-invalid-value.ts)
- [Tests source](../../tests/rules/treemap-no-invalid-value.test.ts)

<!-- end auto-generated rule resources -->
