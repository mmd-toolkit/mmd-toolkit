# @mmd-toolkit/requirement-no-empty-description-block

Japanese version:
[requirement-no-empty-description-block.ja.md](./requirement-no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

An `accDescr` block is written to give the diagram a description. When it holds
nothing or only whitespace, mermaid.js accepts it without an error and leaves
the description unchanged.

## Rule Details

This rule applies to requirement diagrams (`requirementDiagram`). It reports an
`accDescr` block that holds nothing or only whitespace. A block with only
directives is reported too, although mermaid.js applies their settings.

A block with only comments is not reported: the comments show that the block is
meant to do nothing. A block with a comment line and directives is not reported
either.

Empty blocks after the header or after the `}` of a body are reported too.
Inside a requirement or an element, an empty block is reported on its own line,
before a field on the same line, after a field whose value is a string or
keyword, or before the closing `}`. Adjacent blocks are reported individually.

Inside the text of `accTitle:`, `accDescr {}` is part of that text and is not
reported. After a direction,
[requirement-no-ignored-text](./requirement-no-ignored-text.md) reports it.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-empty-description-block: error
requirementDiagram
  accDescr {}
  requirement r {
    id: 1
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-empty-description-block: error
requirementDiagram
  requirement r {
    accDescr {}
    id: 1
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-empty-description-block: error
requirementDiagram
  accDescr { y }
  requirement r {
    id: 1
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-empty-description-block: error
requirementDiagram
  accDescr {
    %% old description
  }
  requirement r {
    id: 1
  }
```

## Options

This rule has no options.

## Related Rules

- [er-no-empty-description-block](./er-no-empty-description-block.md)
- [requirement-no-duplicate-description](./requirement-no-duplicate-description.md)
- [requirement-no-ignored-text](./requirement-no-ignored-text.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/requirement-no-empty-description-block.ts)
- [Tests source](../../tests/rules/requirement-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
