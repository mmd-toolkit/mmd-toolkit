# @mmd-toolkit/architecture-no-empty-description-block

Japanese version:
[architecture-no-empty-description-block.ja.md](./architecture-no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

mermaid.js accepts an empty `accDescr {}` block without an error. The block
leaves the description empty: written first, it changes nothing, and after a
description, it removes that description.

## Rule Details

This rule applies to architecture diagrams (`architecture-beta`). It reports an
`accDescr` block with nothing or only whitespace between its braces. Directives
are not description text, so a block containing only directives is also
reported, though mermaid.js applies their settings.

A block containing a comment line between its braces is not reported. After a
nonempty description, a block containing only comment lines still clears it, and
[architecture-no-duplicate-description](./architecture-no-duplicate-description.md)
reports it. A comment outside the braces, as in `accDescr {} %% later`, does not
prevent a report.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/architecture-no-empty-description-block: error
architecture-beta
  accDescr {}
  service api(server)[API]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/architecture-no-empty-description-block: error
architecture-beta
  accDescr {
    The services of the shop
  }
  service api(server)[API]
```

## Options

This rule has no options.

## Related Rules

- [architecture-no-duplicate-description](./architecture-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/architecture-no-empty-description-block.ts)
- [Tests source](../../tests/rules/architecture-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
