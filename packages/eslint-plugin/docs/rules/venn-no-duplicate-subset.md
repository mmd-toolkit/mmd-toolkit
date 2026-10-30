# @mmd-toolkit/venn-no-duplicate-subset

Japanese version:
[venn-no-duplicate-subset.ja.md](./venn-no-duplicate-subset.ja.md)

Disallow a set or a union that is declared again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js accepts repeated `set` and `union` declarations without an error and
draws the area once per statement. A repeated set draws circles in the same
place and shifts later sets' colors. Later nonempty labels and set sizes replace
earlier ones, while repeated union sizes are drawn as an overlap between them.

## Rule Details

This rule applies to Venn diagrams (`venn-beta`). It reports a `set` or `union`
whose names an earlier declaration already has, even if the statements are
identical. Name order does not count, but repetitions do: `union B, A` repeats
`union A, B`, while `union A, A, B` is different.

A union of three or more sets adds pair areas to the drawing without declaring
those pairs. Declaring such a pair before or after the larger union is not
reported.

Names are case-sensitive and compared as written without surrounding quotes;
`set " A "` differs from `set A`. Character references and HTML attribute quotes
can differ for this rule although mermaid.js reads them alike.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/venn-no-duplicate-subset.ts)
- [Tests source](../../tests/rules/venn-no-duplicate-subset.test.ts)

<!-- end auto-generated rule resources -->
