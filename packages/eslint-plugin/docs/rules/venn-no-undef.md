# @mmd-toolkit/venn-no-undef

Japanese version: [venn-no-undef.ja.md](./venn-no-undef.ja.md)

Disallow a text node or a style for an area that no set or union declares.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`text` places a text node in the area of the sets that it names, and `style`
styles the area, or the text node, that it names. When no `set` or `union`
declares that area, as when a name is misspelled, mermaid.js keeps the statement
without an error, and the drawing shows no text node and styles nothing.

## Rule Details

This rule reports the names after `text` when no set or union has them as its
names, and the names after `style` when no set or union has them and they are
not the one id of a text node. It applies to `venn`.

An area counts wherever the diagram declares it: a `text` or a `style` before
its `set` is not reported, since mermaid.js reads the whole diagram before it
draws it. The names are compared without their order and with their repeats, as
the names of a union are: `style A, B` styles the union of A and B, not the two
sets, so with `set A` and `set B` and no `union A, B`, it is reported. A union
of three or more sets also has the areas of the pairs among them, which the
drawing adds: after `union A, B, C`, `text A, B x` is not reported.

A `style` with one name also styles the text node of that id, as
`style A1 color:red` in the documentation of mermaid.js. The id of a text node
is no area for `text` or for a `style` with more names. An indented `text`
belongs to the set or union just before it and is not checked.

Names are compared with their case and as written, with or without quotes.
mermaid.js turns character references, as `#35;`, and the quotes of HTML
attributes into other characters before it reads a name, so two names that
differ only in those may be one name for mermaid.js and two for this rule. The
drawing finds an area by its names joined with `|`, so `style A, B` styles a set
named `"A|B"`; this rule compares the names and reports it.

Correct the name, or declare the area with `set` or `union`.

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

## Background

The drawing
[places the text nodes of an area](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L259-L276)
only where the layout has that area, and finds a style by the names of
[a set or a union](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L121-L125)
or by
[the id of a text node](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L354-L354).
[`ensurePairwiseSubsets`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L393-L435)
adds the pairs of a larger union.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/venn-no-undef.ts)
- [Tests source](../../tests/rules/venn-no-undef.test.ts)

<!-- end auto-generated rule resources -->
