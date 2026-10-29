# @mmd-toolkit/journey-no-empty-description-block

Japanese version:
[journey-no-empty-description-block.ja.md](./journey-no-empty-description-block.ja.md)

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

This rule applies to user journey diagrams (`journey`). It reports an `accDescr`
block that holds nothing or only whitespace. A block with only directives is
reported too, although mermaid.js applies their settings.

A block with only comments is not reported: the comments show that the block is
meant to do nothing. A block with a comment line and directives is not reported
either.

An empty block on the line of another statement, as in `accDescr {} A: 5`, is
reported too. Inside the text of a title, a section, or a task, or in task data,
`accDescr {}` is part of that text and is not reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/journey-no-empty-description-block: error
journey
  accDescr {}
  section Work
    Make tea: 5: Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-empty-description-block: error
journey
  accDescr { }
  section Work
    Make tea: 5: Me
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/journey-no-empty-description-block: error
journey
  accDescr { y }
  section Work
    Make tea: 5: Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-empty-description-block: error
journey
  accDescr {
    %% old description
  }
  section Work
    Make tea: 5: Me
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.md)
- [journey-no-duplicate-description](./journey-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/journey-no-empty-description-block.ts)
- [Tests source](../../tests/rules/journey-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
