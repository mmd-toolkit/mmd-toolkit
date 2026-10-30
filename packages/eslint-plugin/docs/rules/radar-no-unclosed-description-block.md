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

This rule applies to radar charts (`radar-beta`). It reports an `accDescr {`
block with a `{` on a line after its opening `{`, unless the closing `}` stands
alone on its line. A `}` counts as alone when only whitespace precedes it on
that line. A `{` in a comment line does not count, and a `}` in it closes
nothing.

A block closed on the line of its opening `{` is not reported. Neither is a
block closed by a `}` standing alone, including the `}` of a curve written over
several lines. A description such as `accDescr {` followed by `a {b }` is
reported even when that closing `}` was intended: the rule cannot distinguish it
from the `}` of a curve.

A block with no closing `}` is not reported, because mermaid.js gives an error
for it.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/radar-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/radar-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
