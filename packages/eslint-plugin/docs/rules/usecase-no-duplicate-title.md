# @mmd-toolkit/usecase-no-duplicate-title

Japanese version:
[usecase-no-duplicate-title.ja.md](./usecase-no-duplicate-title.ja.md)

Disallow an `accTitle` that replaces the title set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A use case diagram has one accessible title, which `accTitle` sets. A later
`accTitle` replaces the title set before it without an error, and the earlier
title is lost.

## Rule Details

This rule reports an `accTitle` statement that changes the title that an earlier
`accTitle` set, when that title is not empty. It applies to `usecase`.

After `accTitle: first` and `accTitle: second`, the title is `second`.
`accTitle:` with no text, or with only whitespace, sets the empty title: after
`accTitle: first`, it is reported, because `first` is lost. It does not take the
next line as its title. An `accTitle` after an empty title loses nothing and is
not reported.

A statement that sets the title that the diagram already has is not reported.
Titles are compared without the whitespace at their ends, which mermaid.js
removes, so `accTitle:  first` sets the same title as `accTitle: first`. After
`accTitle: a` and `accTitle: b`, a third `accTitle: a` is reported, because it
replaces `b`. Titles are otherwise compared as written: mermaid.js turns
character references, as `#35;`, and the quotes of HTML attributes into other
characters before it reads a title, so two titles that differ only in those may
be one title for mermaid.js and two for this rule.

Keep one `accTitle` statement.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-title: error
usecase-beta
  accTitle: first
  accTitle: second
  A
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-title: error
usecase-beta
  accTitle: first
  A
```

## Options

This rule has no options.

## Related Rules

- [usecase-no-duplicate-description](./usecase-no-duplicate-description.md)

## Background

The
[`accTitle` statement](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecase.visitor.ts#L127-L131)
gives the title without the whitespace at its ends, and the
[model](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseModelBuilder.ts#L240-L242)
keeps only the last one.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/usecase-no-duplicate-title.ts)
- [Tests source](../../tests/rules/usecase-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
