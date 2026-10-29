# @mmd-toolkit/radar-no-empty-description-block

Japanese version:
[radar-no-empty-description-block.ja.md](./radar-no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

mermaid.js accepts an `accDescr {}` block with nothing in it without an error.
The block leaves the description empty: written first, it changes nothing, and
after a description, it removes that description.

## Rule Details

This rule applies to radar charts (`radar-beta`). It reports an `accDescr` block
with nothing or only whitespace between its braces. Directives are not
description text, so a block containing only directives is also reported, though
mermaid.js applies their settings.

A block containing a comment line between its braces is not reported. A block
containing only comment lines still clears an earlier description, and
[radar-no-duplicate-description](./radar-no-duplicate-description.md) reports it
after a nonempty description. A comment outside the braces, as in
`accDescr {} %% later`, does not prevent a report.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-empty-description-block: error
radar-beta
  accDescr {}
  axis A, B, C
  curve sales{1, 2, 3}
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-empty-description-block: error
radar-beta
  accDescr {
    Sales by region
  }
  axis A, B, C
  curve sales{1, 2, 3}
```

## Options

This rule has no options.

## Related Rules

- [radar-no-duplicate-description](./radar-no-duplicate-description.md)
- [radar-no-unclosed-description-block](./radar-no-unclosed-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/radar-no-empty-description-block.ts)
- [Tests source](../../tests/rules/radar-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
