# @mmd-toolkit/usecase-no-duplicate-description

Japanese version:
[usecase-no-duplicate-description.ja.md](./usecase-no-duplicate-description.ja.md)

Disallow an `accDescr` that replaces the description set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A use case diagram has one accessible description, set by `accDescr` on a line
or in a block. mermaid.js accepts a later description without an error and
replaces the earlier one.

## Rule Details

This rule applies to use case diagrams (`usecase-beta`). It reports an
`accDescr` that changes a nonempty description set by the preceding `accDescr`,
comparing line and block forms together. Repeating the same description or
setting one after an empty description is not reported.

An `accDescr:` with no text clears the description without taking the next line
and is reported after a nonempty description. A block holding only comment lines
also clears it and is reported after a nonempty description too. An empty block
is reported by
[usecase-no-empty-description-block](./usecase-no-empty-description-block.md)
instead.

Comparisons ignore whitespace at the ends and whitespace after line breaks,
including block indentation and empty lines. LF, CRLF, and CR are compared as
LF. Other text is compared as written, so character references and HTML
attribute quotes can differ for this rule although mermaid.js reads them alike.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-description: error
usecase-beta
  accDescr: first
  accDescr: second
  A
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-description: error
usecase-beta
  accDescr: first
  A
```

## Options

This rule has no options.

## Related Rules

- [usecase-no-duplicate-title](./usecase-no-duplicate-title.md)
- [usecase-no-empty-description-block](./usecase-no-empty-description-block.md)
- [usecase-no-unclosed-description-block](./usecase-no-unclosed-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/usecase-no-duplicate-description.ts)
- [Tests source](../../tests/rules/usecase-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
