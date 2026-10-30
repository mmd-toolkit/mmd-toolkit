# @mmd-toolkit/pie-no-duplicate-description

Japanese version:
[pie-no-duplicate-description.ja.md](./pie-no-duplicate-description.ja.md)

Disallow an `accDescr` that replaces the description set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A pie chart has one accessible description, set by `accDescr` on a line or in a
block. mermaid.js accepts a later description without an error and replaces the
earlier one.

## Rule Details

This rule applies to pie charts (`pie`). It reports an `accDescr` that changes a
nonempty description set by the preceding `accDescr`, comparing line and block
forms together. Repeating the same description or setting one after an empty
description is not reported.

An empty or whitespace-only `accDescr:` clears the description without taking
the next line and is reported after a nonempty description. A block holding only
comment lines also clears it and is reported after a nonempty description too.
An empty block is reported by
[pie-no-empty-description-block](./pie-no-empty-description-block.md) instead.

Comparisons ignore whitespace at each line's ends and empty lines, and treat
runs of two or more spaces or tabs as one space. LF, CRLF, and CR are compared
as LF.

Other text is compared as written, so character references and HTML attribute
quotes can differ for this rule although mermaid.js reads them alike.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/pie-no-duplicate-description: error
pie
  accDescr: First
  accDescr: Second
  "A" : 1
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/pie-no-duplicate-description: error
pie
  accDescr: Second
  "A" : 1
```

## Options

This rule has no options.

## Related Rules

- [pie-no-duplicate-title](./pie-no-duplicate-title.md)
- [pie-no-empty-description-block](./pie-no-empty-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/pie-no-duplicate-description.ts)
- [Tests source](../../tests/rules/pie-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
