# @mmd-toolkit/usecase-no-empty-description-block

Japanese version:
[usecase-no-empty-description-block.ja.md](./usecase-no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js accepts a closed `accDescr { }` block with nothing in it without an
error. The block sets the empty description: written first, it changes nothing,
and after a description, it removes that description.

## Rule Details

This rule reports a closed `accDescr` block that holds nothing or only
whitespace. It applies to `usecase`. A directive in the block is no text: a
block that holds only directives is reported too, and mermaid.js still applies
their settings.

After `accDescr: x`, the block `accDescr { }` leaves the empty description, and
`x` is lost. With no description before it, the description stays empty, and the
block changes nothing.

A block that holds only comment lines is not reported. A block left to be filled
in later is written with a comment in it, as `accDescr {`, `%% TODO`, and `}`;
written first, it changes nothing. After a description, such a block removes it
too, and
[usecase-no-duplicate-description](./usecase-no-duplicate-description.md)
reports it.

Write the description, or remove the block.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-empty-description-block: error
usecase-beta
  A
  accDescr {}
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-empty-description-block: error
usecase-beta
  A
  accDescr {
    The steps of a sign-in
  }
```

## Options

This rule has no options.

## Related Rules

- [usecase-no-duplicate-description](./usecase-no-duplicate-description.md)
- [usecase-no-unclosed-description-block](./usecase-no-unclosed-description-block.md)

## Background

The
[`accDescr` statement](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecase.visitor.ts#L132-L140)
gives a block its text between the braces, which is empty for an empty block,
and the
[model](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseModelBuilder.ts#L243-L245)
keeps it as the description.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/usecase-no-empty-description-block.ts)
- [Tests source](../../tests/rules/usecase-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
