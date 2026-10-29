# @mmd-toolkit/eventmodeling-no-unclosed-description-block

Japanese version:
[eventmodeling-no-unclosed-description-block.ja.md](./eventmodeling-no-unclosed-description-block.ja.md)

Disallow an `accDescr {` block that a `}` written for a later statement closes.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

An `accDescr {` block runs to the first `}` after its `{`. When its own `}` is
missing and a later statement holds a `}`, as a frame with inline data such as
`tf 02 cmd Buy { item }` does, mermaid.js closes the block there without an
error: the statements up to it become the description and disappear.

## Rule Details

This rule applies to Event Modeling diagrams (`eventmodeling`). It reports an
`accDescr {` block with a `{` on a line after its opening `{`, unless the
closing `}` stands alone on its line. A `}` counts as alone when only whitespace
precedes it on that line. A `{` in a comment line does not count: the author
does not mean a comment to open what a later `}` closes. A `}` in a comment line
closes the block, because mermaid.js keeps the comment line as text of the
block; such a block is not reported, since nothing after it is taken.

A block closed on the line of its opening `{` is not reported. Neither is a
block closed by a `}` standing alone, including the `}` of a `data` block. A
description such as `accDescr {` followed by `a {b }` is reported even when that
closing `}` was intended: the rule cannot distinguish it from the `}` of inline
data of a frame.

A block with no closing `}` is not reported, because mermaid.js gives an error
for it.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-unclosed-description-block: error
eventmodeling accDescr { first
  tf 01 ui Cart
  tf 02 cmd Buy { item }
  tf 03 evt Bought
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-unclosed-description-block: error
eventmodeling accDescr { first }
  tf 01 ui Cart
  tf 02 cmd Buy { item }
  tf 03 evt Bought
```

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-unclosed-description-block: error
eventmodeling accDescr {
  uses { here
}
  tf 01 cmd Buy { item }
```

## Options

This rule has no options.

## Related Rules

- [eventmodeling-no-empty-description-block](./eventmodeling-no-empty-description-block.md)
- [eventmodeling-no-duplicate-description](./eventmodeling-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/eventmodeling-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/eventmodeling-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
