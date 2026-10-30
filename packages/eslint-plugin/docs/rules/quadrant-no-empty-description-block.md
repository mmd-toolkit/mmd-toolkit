# @mmd-toolkit/quadrant-no-empty-description-block

Japanese version:
[quadrant-no-empty-description-block.ja.md](./quadrant-no-empty-description-block.ja.md)

Disallow a description block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

An `accDescr` block is written to give the diagram a description. When it holds
nothing or only whitespace, mermaid.js accepts it without an error and leaves
the description unchanged.

## Rule Details

This rule applies to quadrant charts (`quadrantChart`). It reports an `accDescr`
block that holds nothing or only whitespace. A block with only directives is
reported too, although mermaid.js applies their settings. The keyword is read in
any case.

A block with only comments is not reported: the comments show that the block is
meant to do nothing.

An empty block before or after a point on the same line is reported too.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-empty-description-block: error
quadrantChart
  accDescr {}
  A: [0.3, 0.6]
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-empty-description-block: error
quadrantChart
  accDescr { }
  A: [0.3, 0.6]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-empty-description-block: error
quadrantChart
  accDescr {
    Campaigns by reach
  }
  A: [0.3, 0.6]
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-empty-description-block: error
quadrantChart
  accDescr {
    %% TODO
  }
  A: [0.3, 0.6]
```

## Options

This rule has no options.

## Related Rules

- [quadrant-no-duplicate-description](./quadrant-no-duplicate-description.md)
- [xychart-no-empty-description-block](./xychart-no-empty-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/quadrant-no-empty-description-block.ts)
- [Tests source](../../tests/rules/quadrant-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
