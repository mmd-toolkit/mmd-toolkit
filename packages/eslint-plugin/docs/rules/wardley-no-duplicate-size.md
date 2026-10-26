# @mmd-toolkit/wardley-no-duplicate-size

Japanese version:
[wardley-no-duplicate-size.ja.md](./wardley-no-duplicate-size.ja.md)

Disallow a `size` that replaces the size set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A map has one size. A later `size` replaces the size set before it without an
error, and the earlier size is lost.

## Rule Details

This rule reports a `size` that gives another width or height than the `size`
before it. It applies to `wardley`.

After `size [1100, 600]` and `size [800, 1000]`, the map is 800 wide and 1000
high.

A `size` that gives the size that the map already has is not reported. Numbers
are compared as numbers. A size in the configuration of the frontmatter or of a
directive is not read.

Write one `size`.

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

## Background

The parser keeps the last `size`, and the
[map](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyParser.ts#L70-L73)
takes its width and its height.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-duplicate-size.ts)
- [Tests source](../../tests/rules/wardley-no-duplicate-size.test.ts)

<!-- end auto-generated rule resources -->
