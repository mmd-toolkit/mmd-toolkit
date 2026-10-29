# @mmd-toolkit/er-no-empty-description-block

Japanese version:
[er-no-empty-description-block.ja.md](./er-no-empty-description-block.ja.md)

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

This rule applies to entity relationship diagrams (`erDiagram`). It reports an
`accDescr` block that holds nothing or only whitespace. A block with only
directives is reported too, although mermaid.js applies their settings.

A block with only comments is not reported: the comments show that the block is
meant to do nothing. A block with a comment line and directives is not reported
either.

An empty block after another statement on its line or after the header is
reported too. Inside the text of `accTitle:`, `accDescr {}` is part of that text
and is not reported. After a direction,
[er-no-ignored-text](./er-no-ignored-text.md) reports it.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/er-no-empty-description-block: error
erDiagram
  A
  accDescr {}
```

```mmd
%% eslint @mmd-toolkit/er-no-empty-description-block: error
erDiagram
  A
  accDescr { }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/er-no-empty-description-block: error
erDiagram
  A
  accDescr { y }
```

```mmd
%% eslint @mmd-toolkit/er-no-empty-description-block: error
erDiagram
  A
  accDescr {
    %% c
  }
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.md)
- [er-no-unclosed-description-block](./er-no-unclosed-description-block.md)
- [er-no-duplicate-description](./er-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/er-no-empty-description-block.ts)
- [Tests source](../../tests/rules/er-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
