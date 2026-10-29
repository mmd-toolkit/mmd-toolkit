# @mmd-toolkit/venn-no-duplicate-style

Japanese version:
[venn-no-duplicate-style.ja.md](./venn-no-duplicate-style.ja.md)

Disallow a style that replaces an earlier value of the same target.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

mermaid.js merges `style` statements for the same target and keeps the last
value of each property. A later value replaces an earlier one without an error,
whether both appear in one statement or separate statements.

## Rule Details

This rule applies to Venn diagrams (`venn-beta`). It reports a `fill`, `color`,
`stroke`, `stroke-width`, or `fill-opacity` property that changes the same
target's latest value, within or across statements. New properties and repeated
values are not reported. Other properties are checked by
[venn-no-invalid-style-key](./venn-no-invalid-style-key.md).

Targets are compared by their lists of names without regard to order, so
`style B, A` and `style A, B` have the same target. Values are compared as
written without surrounding quotes; spaces inside quotes count. Unquoted `2px`
and `2 px` differ for this rule even though mermaid.js joins their parts into
the same value.

mermaid.js converts character references and HTML attribute quotes in names and
values. These conversions can make its matching differ from this rule's
comparisons.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-style: error
venn-beta
set A
style A fill:red, fill:blue
```

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-style: error
venn-beta
set A
style A fill:red, stroke:black
style A fill:blue
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-style: error
venn-beta
set A
style A fill:red, stroke:black
style A color:white
```

## Options

This rule has no options.

## Related Rules

- [venn-no-invalid-style-key](./venn-no-invalid-style-key.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/venn-no-duplicate-style.ts)
- [Tests source](../../tests/rules/venn-no-duplicate-style.test.ts)

<!-- end auto-generated rule resources -->
