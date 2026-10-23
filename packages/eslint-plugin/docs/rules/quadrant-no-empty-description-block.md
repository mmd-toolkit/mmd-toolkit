# @mmd-toolkit/quadrant-no-empty-description-block

Japanese version:
[quadrant-no-empty-description-block.ja.md](./quadrant-no-empty-description-block.ja.md)

Disallow a description block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A description block is written to give the chart its description. When the block
holds nothing, or only whitespace, mermaid.js accepts it and does nothing with
it, so the block has no effect.

## Rule Details

This rule reports an `accDescr` block that holds nothing, only whitespace, or
only line feeds. It applies to `quadrantChart`. A directive in the block is no
text: a block that holds only directives is reported too, and mermaid.js still
applies their settings. The keyword is read in any case.

The description stays what it was before the block: after `accDescr: d`, the
block `accDescr {}` leaves the description `d`.

A block that holds only comments is not reported. The author who turns the lines
of a description into comments means the block to do nothing, and mermaid.js
reads it so. A block left to be filled in later is written with a comment in it,
as `accDescr {`, `%% TODO`, and `}`, and it is not reported.

An empty block may also stand on the line of a point, before or after it, as in
`accDescr {} A: [0.3, 0.6]` and `A: [0.3, 0.6] accDescr {}`. It sets no
description there either, and the rule reports it in the same way.

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
