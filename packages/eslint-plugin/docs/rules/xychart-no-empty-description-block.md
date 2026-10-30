# @mmd-toolkit/xychart-no-empty-description-block

Japanese version:
[xychart-no-empty-description-block.ja.md](./xychart-no-empty-description-block.ja.md)

Disallow a description block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

An `accDescr` block is written to give the diagram a description. When it holds
nothing or only whitespace, mermaid.js accepts it without an error and leaves
the description unchanged.

## Rule Details

This rule applies to XY charts (`xychart` and `xychart-beta`). It reports a
closed `accDescr` block that holds nothing or only whitespace, including line
breaks. A block with only directives is reported too, although mermaid.js
applies their settings. The keyword is read in any case.

A block with only comments is not reported: the comments show that the block is
meant to do nothing.

An empty block before or after another statement on the same line is reported
too. An unclosed block, even an empty one, is reported by
[xychart-no-unclosed-description-block](./xychart-no-unclosed-description-block.md).

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/xychart-no-empty-description-block: error
xychart
  accDescr {}
  line [1, 2]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-empty-description-block: error
xychart
  accDescr { }
  line [1, 2]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/xychart-no-empty-description-block: error
xychart
  accDescr {
    Monthly sales
  }
  line [1, 2]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-empty-description-block: error
xychart
  accDescr {
    %% TODO
  }
  line [1, 2]
```

## Options

This rule has no options.

## Related Rules

- [timeline-no-empty-description-block](./timeline-no-empty-description-block.md)
- [xychart-no-duplicate-description](./xychart-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/xychart-no-empty-description-block.ts)
- [Tests source](../../tests/rules/xychart-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
