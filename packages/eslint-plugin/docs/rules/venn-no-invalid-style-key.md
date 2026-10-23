# @mmd-toolkit/venn-no-invalid-style-key

Japanese version:
[venn-no-invalid-style-key.ja.md](./venn-no-invalid-style-key.ja.md)

Disallow a style property that the drawing does not read.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

The drawing of a venn diagram reads five style properties, the ones that the
documentation of mermaid.js lists: `fill`, `color`, `stroke`, `stroke-width`,
and `fill-opacity`. mermaid.js keeps any other property, as `Fill`, `colour`, or
`opacity`, without an error, and the drawing does not use it.

## Rule Details

This rule reports the name of each property of a `style` statement that is not
one of the five. It applies to `venn`. Names are compared with their case:
`Fill` is reported. A property written twice is reported twice.

The rule does not check which properties a target uses. For a text node, the
drawing reads `color` only, but the documentation of mermaid.js does not say
which properties a text node takes.

Write one of the five properties, in lower case.

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

## Background

[`addStyleData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennDB.ts#L63-L70)
keeps every property with its name as written. The drawing reads the five
properties for
[the sets](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L121-L168),
[the unions](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L171-L230),
and
[the text nodes](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L354-L371).
The
[documentation of mermaid.js](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/venn.md#L125-L145)
lists them.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/venn-no-invalid-style-key.ts)
- [Tests source](../../tests/rules/venn-no-invalid-style-key.test.ts)

<!-- end auto-generated rule resources -->
