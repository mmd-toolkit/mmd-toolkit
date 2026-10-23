# @mmd-toolkit/venn-no-duplicate-subset

Japanese version:
[venn-no-duplicate-subset.ja.md](./venn-no-duplicate-subset.ja.md)

Disallow a set or a union that is declared again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js keeps every `set` and `union` statement, also one for an area that an
earlier statement declares, without an error, and the drawing draws the area
once for each statement. A set declared twice is drawn as two circles in one
place, each in a colour of its own, and the sets after it take the colours after
them. A later nonempty label replaces the earlier label, the size of a later
`set` replaces the size of the earlier one, and two sizes of one union are drawn
as an overlap between them.

## Rule Details

This rule reports a `set` or `union` statement whose names an earlier `set` or
`union` statement already has. It applies to `venn`.

The drawing keeps the last nonempty label. An absent label and `[""]` add no
label to the Db, while `[" "]` stores an empty label after trimming; none of
these replaces an earlier nonempty label in the drawing.

The names are compared without their order and with their repeats: `union B, A`
declares the union of `union A, B` again, while `union A, A, B` is another
union. The same statement written twice is reported too, since the area is drawn
twice. A union of three or more sets also gives the drawing the pairs among them
that no statement declares; a union of two of them, written before or after it,
declares that pair and is not reported.

Names are compared with their case and as written, with or without quotes:
`set "A"` declares `set A` again, and `set " A "` is another set. mermaid.js
turns character references, as `#35;`, and the quotes of HTML attributes into
other characters before it reads a name, so two names that differ only in those
may be one name for mermaid.js and two for this rule.

An indented `text` belongs to the set or union just before it. To add a text
node to a set later in the diagram, write `text` with the name of the set at the
start of a line, as `text A A3`, instead of declaring the set again.

Declare each set and each union once.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-subset: error
venn-beta
set A[Alpha]:20
set B[Beta]
set A[Gamma]:5
```

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-subset: error
venn-beta
set A
set B
union A, B[Shared]
union B, A[Both]
```

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-subset: error
venn-beta
set A["Frontend"]:20
  text A1["React"]
set B
set A
  text A3["Vue"]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-subset: error
venn-beta
set A[Alpha]:20
set B[Beta]
union A, B[Shared]
```

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-subset: error
venn-beta
set A["Frontend"]:20
  text A1["React"]
set B
text A A3["Vue"]
```

## Options

This rule has no options.

## Background

[`addSubsetData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennDB.ts#L23-L36)
appends each statement, and
[`draw`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L52-L61)
passes all of them to @upsetjs/venn.js 2.0.0, which
[draws an area for each](https://github.com/upsetjs/venn.js/blob/350c835aab4a92a7570963c28f725cf9f6e5f258/src/diagram.js#L164-L176),
[keeps the last nonempty label of an area](https://github.com/upsetjs/venn.js/blob/350c835aab4a92a7570963c28f725cf9f6e5f258/src/diagram.js#L102-L107),
and
[takes the size of a set from its last statement](https://github.com/upsetjs/venn.js/blob/350c835aab4a92a7570963c28f725cf9f6e5f258/src/layout.js#L330-L340).
mermaid.js gives each circle the
[colour of its place](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennRenderer.ts#L121-L130).

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/venn-no-duplicate-subset.ts)
- [Tests source](../../tests/rules/venn-no-duplicate-subset.test.ts)

<!-- end auto-generated rule resources -->
