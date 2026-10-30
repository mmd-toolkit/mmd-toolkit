# @mmd-toolkit/wardley-no-empty-description-block

Japanese version:
[wardley-no-empty-description-block.ja.md](./wardley-no-empty-description-block.ja.md)

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

This rule applies to Wardley maps (`wardley-beta`). It reports an `accDescr`
block with nothing or only whitespace between its braces. Directives are not
description text, so a block containing only directives is also reported, though
mermaid.js applies their settings.

A block containing a comment line between its braces is not reported. After a
nonempty description, a block holding only comment lines clears it, and
[wardley-no-duplicate-description](./wardley-no-duplicate-description.md)
reports that block. A comment before the `{` or after the `}` is not in the
block, so the block is still reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-empty-description-block: error
wardley-beta
  accDescr {}
  component API [0.6, 0.7]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-empty-description-block: error
wardley-beta
  accDescr {
    The parts of a service
  }
  component API [0.6, 0.7]
```

## Options

This rule has no options.

## Related Rules

- [wardley-no-duplicate-description](./wardley-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-empty-description-block.ts)
- [Tests source](../../tests/rules/wardley-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
