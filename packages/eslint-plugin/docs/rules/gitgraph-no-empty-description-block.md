# @mmd-toolkit/gitgraph-no-empty-description-block

Japanese version:
[gitgraph-no-empty-description-block.ja.md](./gitgraph-no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

mermaid.js accepts an empty `accDescr {}` block without an error. Written first,
it changes nothing; after a description, it removes that description.

## Rule Details

This rule applies to Git graphs (`gitGraph`). It reports an `accDescr` block
holding nothing or only whitespace between its braces. A block holding only
directives is also reported, although mermaid.js still applies their settings.

A block with a comment line inside its braces, as a block left to be filled in
later, is not reported by this rule. After a description, that block still
clears it and is reported by
[gitgraph-no-duplicate-description](./gitgraph-no-duplicate-description.md). A
comment outside the braces, as in `accDescr {} %% later`, does not prevent a
report.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-empty-description-block: error
gitGraph
  accDescr {}
  commit
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-empty-description-block: error
gitGraph
  accDescr {
    Release history
  }
  commit
```

## Options

This rule has no options.

## Related Rules

- [gitgraph-no-duplicate-description](./gitgraph-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gitgraph-no-empty-description-block.ts)
- [Tests source](../../tests/rules/gitgraph-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
