# @mmd-toolkit/sankey-no-invalid-value

Japanese version:
[sankey-no-invalid-value.ja.md](./sankey-no-invalid-value.ja.md)

Disallow a link value that mermaid.js does not read as written.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

The third field of a record is the value of the link, the size of the flow.
mermaid.js reads it as a number from the start of the field and drops the rest
without an error: `"1,234"`, with a thousands separator, is the value 1, and a
field with no number at its start, as `abc`, is no number at all, so the link
has no size.

## Rule Details

This rule applies to Sankey diagrams (`sankey` and `sankey-beta`). It reports a
link value, in quotes or not, that is not a number from its start to its end,
without the whitespace at its ends. A number is an optional sign, then digits
with an optional decimal point and exponent, or `Infinity`. So `5 TWh`, `1_000`,
`0x10`, and `infinity` are reported, and so is a value of spaces only.

Values such as `+5`, `.5`, `5.`, `1e3`, `-2`, `-0`, and `Infinity` are not
reported. Text after the number that starts with `%%`, as in `1 %% note`, is not
reported, because it is written as a comment and mermaid.js drops it.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/sankey-no-invalid-value: error
sankey
Electricity grid,Homes,"1,234"
```

```mmd
%% eslint @mmd-toolkit/sankey-no-invalid-value: error
sankey
Electricity grid,Homes,unknown
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/sankey-no-invalid-value: error
sankey
Electricity grid,Homes,1234
```

```mmd
%% eslint @mmd-toolkit/sankey-no-invalid-value: error
sankey
Electricity grid,Homes,113.726 %% estimate
```

## Options

This rule has no options.

## Related Rules

- [journey-no-invalid-score](./journey-no-invalid-score.md)
- [sankey-no-empty-node](./sankey-no-empty-node.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/sankey-no-invalid-value.ts)
- [Tests source](../../tests/rules/sankey-no-invalid-value.test.ts)

<!-- end auto-generated rule resources -->
