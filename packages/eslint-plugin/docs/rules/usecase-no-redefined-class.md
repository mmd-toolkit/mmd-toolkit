# @mmd-toolkit/usecase-no-redefined-class

Japanese version:
[usecase-no-redefined-class.ja.md](./usecase-no-redefined-class.ja.md)

Disallow a `classDef` that drops or changes the styles of the class defined
before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

`classDef` defines a class's styles. A later `classDef` for that class replaces
the whole definition without an error. Adding a stroke in another definition can
therefore remove an earlier fill.

## Rule Details

This rule applies to use case diagrams (`usecase-beta`). It reports each class
in a `classDef` that drops or changes a style from its latest definition.
Keeping every style is not reported, even when adding or reordering styles.

When a property repeats within one definition, its last value is compared.
Property names are case-sensitive because names such as `color` style the label
while `COLOR` styles the shape. Values ignore whitespace at the ends and compare
runs of whitespace outside quoted strings as one space; `font-family:"A  B"` and
`font-family:"A B"` remain different.

A `style` statement adds styles to an element and is not compared.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-redefined-class: error
usecase-beta
  A:::hot
  classDef hot fill:red
  classDef hot stroke:blue
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-redefined-class: error
usecase-beta
  A:::hot
  classDef hot fill:red, stroke:blue
```

## Options

This rule has no options.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/usecase-no-redefined-class.ts)
- [Tests source](../../tests/rules/usecase-no-redefined-class.test.ts)

<!-- end auto-generated rule resources -->
