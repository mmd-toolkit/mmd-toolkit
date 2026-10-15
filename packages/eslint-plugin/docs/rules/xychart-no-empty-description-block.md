# @mmd-toolkit/xychart-no-empty-description-block

Japanese version:
[xychart-no-empty-description-block.ja.md](./xychart-no-empty-description-block.ja.md)

Disallow a description block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A description block is written to give the chart its description. When the block
holds nothing, or only whitespace, mermaid.js accepts it and does nothing with
it, so the block has no effect.

## Rule Details

This rule reports a closed `accDescr` block that holds nothing, only whitespace,
or only line feeds. It applies to `xychart`. A directive in the block is no
text: a block that holds only directives is reported too, and mermaid.js still
applies their settings. The keyword is read in any case.

The description stays what it was before the block: after `accDescr: a`, the
block `accDescr {}` leaves the description `a`, and so does a block after
another block.

A block that holds only comments is not reported. The author who turns the lines
of a description into comments means the block to do nothing, and mermaid.js
reads it so. A block left to be filled in later is written with a comment in it,
as `accDescr {`, `%% TODO`, and `}`, and it is not reported.

An empty block may also stand on the line of another statement, before or after
it, as in `title T accDescr {}` and `accDescr {} title T`. It sets no
description there either, and the rule reports it in the same way. A block that
is not closed is reported by
[xychart-no-unclosed-description-block](./xychart-no-unclosed-description-block.md),
also when it holds nothing.

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
