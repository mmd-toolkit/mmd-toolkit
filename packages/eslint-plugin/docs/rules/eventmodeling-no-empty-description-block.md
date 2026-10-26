# @mmd-toolkit/eventmodeling-no-empty-description-block

Japanese version:
[eventmodeling-no-empty-description-block.ja.md](./eventmodeling-no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js accepts an `accDescr { }` block with nothing in it without an error.
The block gives no description of its own: mermaid.js sets the text of the
statement, as `accDescr {}`, as the description, and after a description, the
block removes that description.

## Rule Details

This rule reports an `accDescr` block that holds nothing or only whitespace
between its braces. It applies to `eventmodeling`. A directive in the block is
no text: a block that holds only directives is reported too, and mermaid.js
still applies their settings.

After `accDescr: x`, the block `accDescr {}` replaces the description with the
text of the block, `accDescr {}` with the space before it, and `x` is lost. With
no description before it, the description is that text too: the keyword and the
braces, and no description of the author.

A block that holds a comment line between its braces is not reported. A block
left to be filled in later is written with a comment in it, as `accDescr {`,
`%% TODO`, and `}`. After a description, such a block removes it too, and
[eventmodeling-no-duplicate-description](./eventmodeling-no-duplicate-description.md)
reports it. A comment after the `}`, as in `accDescr {} %% later`, is not in the
block, and the block is reported.

Write the description, or remove the block.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-empty-description-block: error
eventmodeling accDescr {}
  tf 01 evt Bought
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-empty-description-block: error
eventmodeling accDescr { Checkout flow }
  tf 01 evt Bought
```

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-empty-description-block: error
eventmodeling accDescr {
%% TODO
}
  tf 01 evt Bought
```

## Options

This rule has no options.

## Related Rules

- [eventmodeling-no-duplicate-description](./eventmodeling-no-duplicate-description.md)

## Background

The
[terminal](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L60-L60)
of `accDescr` takes the whole statement, also of an empty block, and the
[value converter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L6-L41)
does not convert it. The parser keeps the last description, and
[`populateCommonDb`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L14)
sets it, since it is never empty.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/eventmodeling-no-empty-description-block.ts)
- [Tests source](../../tests/rules/eventmodeling-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
