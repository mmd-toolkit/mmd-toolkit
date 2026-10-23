# @mmd-toolkit/venn-no-duplicate-style

Japanese version:
[venn-no-duplicate-style.ja.md](./venn-no-duplicate-style.ja.md)

Disallow a style that replaces an earlier value of the same target.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

In `style A fill:red, fill:blue`, mermaid.js keeps only `blue`. A later
`style A fill:blue` statement replaces `red` in the same way: the drawing merges
the `style` statements of one target, and a later value of a property replaces
the earlier one. mermaid.js gives no error.

## Rule Details

This rule reports a property `fill`, `color`, `stroke`, `stroke-width`, or
`fill-opacity` that gives a target a value other than the one that the same
property gave it before, in the same statement or in an earlier one. It applies
to `venn`.

A target is the list of names after `style`, compared without their order:
`style B, A` styles the target of `style A, B`. A property that the target has
not had before is not reported: `style A fill:red` and `style A stroke:blue`
give A both. Other properties change nothing in the drawing; they are not
compared, and [venn-no-invalid-style-key](./venn-no-invalid-style-key.md)
reports them.

A property that gives the value that the target already has is not reported.
Values are compared as written, with or without quotes: `fill:"red"` after
`fill:red` is the same, while the spaces inside quotes count. After `fill:red`
and `fill:blue`, a third `fill:red` is reported, because it replaces `blue`.
mermaid.js joins the parts of a value without quotes with one space, also where
no space separates them, so `2px` and `2 px` are one value for mermaid.js and
two for this rule.

mermaid.js converts character references and HTML attribute quotes before it
reads names and values, and the drawing joins target names with `|`, so two
spellings may be one value or target for mermaid.js and two for this rule, or
the reverse.

Give each property of a target once.

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

## Background

[`addStyleData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennDB.ts#L63-L70)
keeps the last value of a property in one statement, and
[`buildStyleByKey`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L17-L29)
merges the statements of one target, the later values replacing the earlier
ones.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/venn-no-duplicate-style.ts)
- [Tests source](../../tests/rules/venn-no-duplicate-style.test.ts)

<!-- end auto-generated rule resources -->
