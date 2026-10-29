# @mmd-toolkit/requirement-no-duplicate-description

Japanese version:
[requirement-no-duplicate-description.ja.md](./requirement-no-duplicate-description.ja.md)

Disallow an `accDescr` statement that sets the description again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A diagram has one description. When another `accDescr` statement sets it,
mermaid.js uses the later description without an error, and the earlier one is
lost.

## Rule Details

This rule applies to requirement diagrams (`requirementDiagram`). It reports an
`accDescr:` statement or a description block that replaces the current
description with a different one. A statement that repeats the current
description is not reported, even when the two forms are mixed.

Descriptions are compared without the whitespace at their ends or after each
line break, so indentation and empty lines in a block do not count. LF, CRLF,
and CR line breaks are compared as LF. After `accDescr: a` and `accDescr: b`, a
third `accDescr: a` is reported because it replaces `b`.

An `accDescr:` with no text on its line also sets the description and is
counted: it takes the next line that holds text. A block with no description,
including one with only comments or directives, is not counted. An empty block
inside a requirement or an element is not counted either.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-description: error
requirementDiagram
  accDescr: first
  accDescr { second }
  requirement r {
    id: 1
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-description: error
requirementDiagram
  accDescr: first
  requirement r {
    id: 1
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-description: error
requirementDiagram
  accDescr: first
  accDescr {
    first
  }
  requirement r {
    id: 1
  }
```

## Options

This rule has no options.

## Related Rules

- [er-no-duplicate-description](./er-no-duplicate-description.md)
- [requirement-no-duplicate-title](./requirement-no-duplicate-title.md)
- [requirement-no-empty-description-block](./requirement-no-empty-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/requirement-no-duplicate-description.ts)
- [Tests source](../../tests/rules/requirement-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
