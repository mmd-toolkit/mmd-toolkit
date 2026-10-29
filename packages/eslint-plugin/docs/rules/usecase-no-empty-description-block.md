# @mmd-toolkit/usecase-no-empty-description-block

Japanese version:
[usecase-no-empty-description-block.ja.md](./usecase-no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

mermaid.js accepts a closed, empty `accDescr {}` block without an error. Written
first, it changes nothing; after a description, it removes that description.

## Rule Details

This rule applies to use case diagrams (`usecase-beta`). It reports a closed
`accDescr` block holding nothing or only whitespace. A block holding only
directives is also reported, although mermaid.js still applies their settings.

A block holding only comment lines is not reported by this rule. After a
description, that block still clears it and is reported by
[usecase-no-duplicate-description](./usecase-no-duplicate-description.md).

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-empty-description-block: error
usecase-beta
  A
  accDescr {}
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-empty-description-block: error
usecase-beta
  A
  accDescr {
    The steps of a sign-in
  }
```

## Options

This rule has no options.

## Related Rules

- [usecase-no-duplicate-description](./usecase-no-duplicate-description.md)
- [usecase-no-unclosed-description-block](./usecase-no-unclosed-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/usecase-no-empty-description-block.ts)
- [Tests source](../../tests/rules/usecase-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
