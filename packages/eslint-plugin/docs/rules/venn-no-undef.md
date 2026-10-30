# @mmd-toolkit/venn-no-undef

Japanese version: [venn-no-undef.ja.md](./venn-no-undef.ja.md)

Disallow a text node or a style for an area that no set or union declares.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`text` places text in a named area, and `style` styles an area or text node.
When no `set` or `union` declares the named area, mermaid.js accepts the
statement without an error but draws no text and applies no style.

## Rule Details

This rule applies to Venn diagrams (`venn-beta`). It reports names after `text`
that no set or union declares, and names after `style` that name neither an area
nor a single id of a text node. Declarations anywhere in the diagram count, so
statements before their declarations are not reported.

Area names are compared without regard to order but with repetitions.
`style A, B` targets the union, so separate `set A` and `set B` declarations do
not suffice. A union of three or more sets also supplies its pair areas, so
`text A, B x` after `union A, B, C` is not reported.

A `style` with one name can target the id of a text node; that id is not an area
for `text` or a `style` with several names. Indented `text` belongs to the
preceding set or union and is not checked.

Names are case-sensitive and compared as written without surrounding quotes.
Character references and HTML attribute quotes can make mermaid.js match
differently.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/venn-no-undef: error
venn-beta
set A
text Typo A1[Review]
```

```mmd
%% eslint @mmd-toolkit/venn-no-undef: error
venn-beta
set A
set B
style A, B fill:red
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/venn-no-undef: error
venn-beta
set A
set B
union A, B
text A, B AB1[Shared]
style A, B fill:red
```

```mmd
%% eslint @mmd-toolkit/venn-no-undef: error
venn-beta
set A
text A A1[React]
style A1 color:red
```

## Options

This rule has no options.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/venn-no-undef.ts)
- [Tests source](../../tests/rules/venn-no-undef.test.ts)

<!-- end auto-generated rule resources -->
