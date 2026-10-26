# @mmd-toolkit/radar-no-unclosed-description-block

Japanese version:
[radar-no-unclosed-description-block.ja.md](./radar-no-unclosed-description-block.ja.md)

Disallow an `accDescr {` block that a `}` written for a later statement closes.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

An `accDescr {` block runs to the first `}` after its `{`. When its own `}` is
missing and a later statement holds a `}`, as a curve such as
`curve sales{1, 2, 3}` does, mermaid.js closes the block there without an error:
the statements up to it become the description and disappear.

## Rule Details

This rule reports an `accDescr {` block that the `}` of a later statement
closes. It applies to `radar`. A block that no `}` closes is rejected by
mermaid.js, and the rule does not see it.

Every character up to the first `}` after the `{` of the block, a `{` too, is
its text. After `accDescr { first`, the lines `axis A, B, C` and
`curve sales{1, 2, 3}` give the description `first`, `axis A, B, C`, and
`curve sales{1, 2, 3`, and the diagram has no axis and no curve. A comment line
in the block is no text, and a `}` in it closes nothing.

The rule reports a block whose text holds a `{` on a later line than the `{` of
the block, unless the `}` that closes the block stands alone on its line: the
`}` that then closes the block is the first one after that `{`, the one of a
curve. A `}` on the line of the `{`, as in `accDescr { a { b }`, and a `}` alone
on its line close the block as written, and are not reported. A `}` is alone on
its line when only whitespace and directives stand before it there. So a block
that the `}` of a curve written over several lines closes, where that `}` stands
alone on its line, is not reported. A description that holds a `{` and ends with
its own `}` on a later line, as `accDescr {`, then `a {b }`, is reported too:
the rule does not tell that `}` from the `}` of a curve. This is the reason that
the `recommended` configuration does not enable the rule.

Close the block where the description ends.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-unclosed-description-block: error
radar-beta
  accDescr { first
  axis A, B, C
  curve sales{1, 2, 3}
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/radar-no-unclosed-description-block: error
radar-beta
  accDescr { first }
  axis A, B, C
  curve sales{1, 2, 3}
```

```mmd
%% eslint @mmd-toolkit/radar-no-unclosed-description-block: error
radar-beta
  accDescr {
    uses { here
  }
  axis A, B, C
  curve sales{1, 2, 3}
```

## Options

This rule has no options.

## Related Rules

- [radar-no-empty-description-block](./radar-no-empty-description-block.md)
- [radar-no-duplicate-description](./radar-no-duplicate-description.md)

## Background

The
[terminal of the block](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/common.langium#L14-L14)
ends the block at the first `}` after its `{`, and does not match a block
without one.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/radar-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/radar-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
