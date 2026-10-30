# @mmd-toolkit/wardley-no-duplicate-size

Japanese version:
[wardley-no-duplicate-size.ja.md](./wardley-no-duplicate-size.ja.md)

Disallow a `size` that replaces the size set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A map has one size. A later `size` replaces the size set before it without an
error, and the earlier size is lost.

## Rule Details

This rule applies to Wardley maps (`wardley-beta`). It reports a `size` giving a
different width or height from the preceding `size`. Repeating the current size
is not reported. Numbers are compared as numbers.

The rule does not read sizes in frontmatter or directive configuration.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-size: error
wardley-beta
  size [1100, 600]
  size [800, 1000]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-size: error
wardley-beta
  size [800, 1000]
```

## Options

This rule has no options.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-duplicate-size.ts)
- [Tests source](../../tests/rules/wardley-no-duplicate-size.test.ts)

<!-- end auto-generated rule resources -->
