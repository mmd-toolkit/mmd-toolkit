# @mmd-toolkit/gantt-no-empty-description-block

Japanese version:
[gantt-no-empty-description-block.ja.md](./gantt-no-empty-description-block.ja.md)

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

This rule applies to Gantt charts (`gantt`). It reports an `accDescr` block that
holds nothing or only whitespace. A block with only directives is reported too,
although mermaid.js applies their settings.

A block with only comments is not reported: the comments show that the block is
meant to do nothing. A block with a comment line and directives is not reported
either.

An empty block on the line of another statement, as in `accDescr {} a : 1d`, is
reported too. Inside the text of a title, a setting, or a task, or in task data,
`accDescr {}` is part of that text and is not reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-empty-description-block: error
gantt
  accDescr {}
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-empty-description-block: error
gantt
  accDescr { }
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-empty-description-block: error
gantt
  accDescr { y }
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-empty-description-block: error
gantt
  accDescr {
    %% old description
  }
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.md)
- [gantt-no-duplicate-description](./gantt-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gantt-no-empty-description-block.ts)
- [Tests source](../../tests/rules/gantt-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
