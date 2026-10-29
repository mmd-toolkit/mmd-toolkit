# @mmd-toolkit/xychart-no-unclosed-description-block

Japanese version:
[xychart-no-unclosed-description-block.ja.md](./xychart-no-unclosed-description-block.ja.md)

Disallow a description block that is not closed by `}`.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

When the closing `}` of an `accDescr` block is missing, mermaid.js accepts it
without an error. The block takes all following statements as its text, and the
description becomes empty whatever the block holds.

## Rule Details

This rule applies to XY charts (`xychart` and `xychart-beta`). It reports an
`accDescr {` block without a closing `}`, also `accDescr {` with nothing after
it at the end of the text.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/xychart-no-unclosed-description-block: error
xychart
  accDescr { Monthly sales
  title Sales
  line [1, 2]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/xychart-no-unclosed-description-block: error
xychart
  accDescr { Monthly sales }
  title Sales
  line [1, 2]
```

## Options

This rule has no options.

## Related Rules

- [xychart-no-duplicate-description](./xychart-no-duplicate-description.md)
- [xychart-no-empty-description-block](./xychart-no-empty-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/xychart-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/xychart-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
