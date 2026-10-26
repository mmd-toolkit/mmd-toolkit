# @mmd-toolkit/treeview-no-empty-description-block

Japanese version:
[treeview-no-empty-description-block.ja.md](./treeview-no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js accepts an `accDescr { }` block with nothing in it without an error.
The block leaves the description empty: written first, it changes nothing, and
after a description, it removes that description.

## Rule Details

This rule reports an `accDescr` block that holds nothing or only whitespace
between its braces. It applies to `treeView`. A directive in the block is no
text: a block that holds only directives is reported too, and mermaid.js still
applies their settings.

After `accDescr: x`, the block `accDescr { }` leaves the description empty, and
`x` is lost. With no description before it, the description stays empty, and the
block changes nothing.

A block that holds a comment line between its braces is not reported. A block
left to be filled in later is written with a comment in it, as `accDescr {`,
`%% TODO`, and `}`; written first, it changes nothing. After a description, such
a block removes it too, and
[treeview-no-duplicate-description](./treeview-no-duplicate-description.md)
reports it. A comment before the `{` or after the `}`, as in
`accDescr {}%% later`, is not in the block, and the block is reported.

Write the description, or remove the block.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/treeview-no-empty-description-block: error
treeView-beta
  accDescr {}
  root/
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/treeview-no-empty-description-block: error
treeView-beta
  accDescr { Project files }
  root/
```

```mmd
%% eslint @mmd-toolkit/treeview-no-empty-description-block: error
treeView-beta
  accDescr {
%% TODO
  }
  root/
```

## Options

This rule has no options.

## Related Rules

- [treeview-no-duplicate-description](./treeview-no-duplicate-description.md)

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

- [Rule source](../../src/rules/treeview-no-empty-description-block.ts)
- [Tests source](../../tests/rules/treeview-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
