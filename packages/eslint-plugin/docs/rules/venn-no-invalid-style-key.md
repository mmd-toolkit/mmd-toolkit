# @mmd-toolkit/venn-no-invalid-style-key

Japanese version:
[venn-no-invalid-style-key.ja.md](./venn-no-invalid-style-key.ja.md)

Disallow a style property that the drawing does not read.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

mermaid.js uses five style properties in the drawing: `fill`, `color`, `stroke`,
`stroke-width`, and `fill-opacity`. It accepts other names such as `Fill`,
`colour`, and `opacity` without an error, but does not use them in the drawing.

## Rule Details

This rule applies to Venn diagrams (`venn-beta`). It reports each property name
in a `style` statement that is not one of those five. Names are case-sensitive,
so `Fill` is reported. A property written twice is reported twice.

The rule checks the name only, not the target. For a union, the drawing uses
only `fill` and `color`; for a text node, only `color`. Another of the five for
them, as `style A1 fill:red` for a text node, is not reported, because the
documentation of mermaid.js gives the five for sets, unions, and text nodes
alike.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/venn-no-invalid-style-key: error
venn-beta
set A
style A Fill:red, opacity:0.5
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/venn-no-invalid-style-key: error
venn-beta
set A
style A fill:red, fill-opacity:0.5
```

## Options

This rule has no options.

## Related Rules

- [venn-no-duplicate-style](./venn-no-duplicate-style.md)

## Further Reading

- [Venn diagram syntax: styling](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/venn.md#L125-L145)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/venn-no-invalid-style-key.ts)
- [Tests source](../../tests/rules/venn-no-invalid-style-key.test.ts)

<!-- end auto-generated rule resources -->
