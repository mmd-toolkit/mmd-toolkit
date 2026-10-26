# @mmd-toolkit/radar-no-empty-description-block

Japanese version:
[radar-no-empty-description-block.ja.md](./radar-no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js accepts an `accDescr { }` block with nothing in it without an error.
The block leaves the description empty: written first, it changes nothing, and
after a description, it removes that description.

## Rule Details

This rule reports an `accDescr` block that holds nothing or only whitespace
between its braces. It applies to `radar`. A directive in the block is no text:
a block that holds only directives is reported too, and mermaid.js still applies
their settings.

After `accDescr: x`, the block `accDescr { }` leaves the description empty, and
`x` is lost. With no description before it, the description stays empty, and the
block changes nothing.

A block that holds a comment line between its braces is not reported. A block
left to be filled in later is written with a comment in it, as `accDescr {`,
`%% TODO`, and `}`; written first, it changes nothing. After a description, such
a block removes it too, and
[radar-no-duplicate-description](./radar-no-duplicate-description.md) reports
it. A comment before the `{` or after the `}`, as in `accDescr {} %% later`, is
not in the block, and the block is reported.

Write the description, or remove the block.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-empty-description-block: error
radar-beta
  accDescr {}
  axis A, B, C
  curve sales{1, 2, 3}
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-empty-description-block: error
radar-beta
  accDescr {
    Sales by region
  }
  axis A, B, C
  curve sales{1, 2, 3}
```

## Options

This rule has no options.

## Related Rules

- [radar-no-duplicate-description](./radar-no-duplicate-description.md)
- [radar-no-unclosed-description-block](./radar-no-unclosed-description-block.md)

## Background

The
[value converter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L61-L68)
gives an empty block the empty description. The parser keeps the last
description, and
[`populateCommonDb`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L14)
sets a description only when it is not empty, so an empty block written last
leaves the description empty.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/radar-no-empty-description-block.ts)
- [Tests source](../../tests/rules/radar-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
