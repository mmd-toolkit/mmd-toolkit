# @mmd-toolkit/usecase-no-unclosed-description-block

Japanese version:
[usecase-no-unclosed-description-block.ja.md](./usecase-no-unclosed-description-block.ja.md)

Disallow an `accDescr {` block that a `}` written for a later statement closes.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

An `accDescr {` block runs to the first `}` after its `{`. When its own `}` is
missing and a later statement holds a `}`, as the metadata of
`actor C@{ type: hollow }` does, mermaid.js closes the block there without an
error: the statements up to it become the description and disappear.

## Rule Details

This rule reports an `accDescr {` block that the `}` of a later statement
closes. It applies to `usecase`. A block that no `}` closes is rejected by
mermaid.js, and the rule does not see it.

Every character up to the first `}` after the `{` of the block, a `{` too, is
its text. After `accDescr { first`, the lines `A --> B`,
`actor C@{ type: hollow }`, and `D` give the description `first`, `A --> B`, and
`actor C@{ type: hollow`, and only the use case `D`: the relationship and the
actor are lost. A comment line in the block is no text, and a `}` in it closes
nothing.

The rule reports a block whose text holds a `{` on a later line than the `{` of
the block, unless the `}` that closes the block stands alone on its line: the
`}` that then closes the block is the first one after that `{`, the one of
metadata or of a JSON object. A `}` on the line of the `{`, as in
`accDescr { a { b }`, and a `}` alone on its line close the block as written,
and are not reported. A `}` is alone on its line when only whitespace and
directives stand before it there. So a block that the `}` of metadata written
over several lines closes, where that `}` stands alone on its line, is not
reported. A description that holds a `{` and ends with its own `}` on a later
line, as `accDescr {`, then `a {b }`, is reported too: the rule does not tell
that `}` from the `}` of metadata. This is the reason that the `recommended`
configuration does not enable the rule.

Close the block where the description ends.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-unclosed-description-block: error
usecase-beta
  accDescr { first
  A --> B
  actor C@{ type: hollow }
  D
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-unclosed-description-block: error
usecase-beta
  accDescr { first }
  A --> B
  actor C@{ type: hollow }
  D
```

```mmd
%% eslint @mmd-toolkit/usecase-no-unclosed-description-block: error
usecase-beta
  accDescr {
    uses { here
  }
  A
```

## Options

This rule has no options.

## Related Rules

- [usecase-no-empty-description-block](./usecase-no-empty-description-block.md)
- [usecase-no-duplicate-description](./usecase-no-duplicate-description.md)

## Background

The
[lexer of the block](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecase.tokens.ts#L70-L80)
ends the block at the first `}` after its `{`, and does not match a block
without one.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/usecase-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/usecase-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
