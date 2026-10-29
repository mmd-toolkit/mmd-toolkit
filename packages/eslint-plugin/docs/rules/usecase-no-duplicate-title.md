# @mmd-toolkit/usecase-no-duplicate-title

Japanese version:
[usecase-no-duplicate-title.ja.md](./usecase-no-duplicate-title.ja.md)

Disallow an `accTitle` that replaces the title set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A use case diagram has one accessible title, set by `accTitle`. mermaid.js
accepts a later `accTitle` without an error and replaces the earlier title.

## Rule Details

This rule applies to use case diagrams (`usecase-beta`). It reports an
`accTitle` that changes a nonempty accessible title set by the preceding
`accTitle`. Repeating the current title or setting one after an empty title is
not reported.

An empty or whitespace-only `accTitle:` clears the title without taking the next
line and is reported after a nonempty title. Comparisons ignore whitespace at
the ends. Other text is compared as written, so character references and HTML
attribute quotes can differ for this rule although mermaid.js reads them alike.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/usecase-no-duplicate-title.ts)
- [Tests source](../../tests/rules/usecase-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
