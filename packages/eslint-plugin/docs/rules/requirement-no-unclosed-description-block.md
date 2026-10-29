# @mmd-toolkit/requirement-no-unclosed-description-block

Japanese version:
[requirement-no-unclosed-description-block.ja.md](./requirement-no-unclosed-description-block.ja.md)

Disallow an `accDescr {` block that a `}` written for something else closes.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A description block ends at the first `}` after its `{`. When the `}` of the
block is missing and a later statement holds a `}`, as the body of a requirement
or an element does, mermaid.js closes the description block there and reads the
lines up to it as the description, without an error. When no `}` follows,
mermaid.js gives an error.

## Rule Details

This rule applies to requirement diagrams (`requirementDiagram`). It reports a
description block with a `{` in its text on a later line than the opening `{`.
It also reports a description that intentionally contains that `{` and has its
own closing `}`: the rule cannot tell its `}` from the `}` of a body. A block
whose closing `}` is on the opening line is not reported, even if that line
contains another `{`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-unclosed-description-block: error
requirementDiagram
  accDescr { x
  requirement r {
    id: 1
  }
  element e {
    type: simulation
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-unclosed-description-block: error
requirementDiagram
  accDescr { x }
  requirement r {
    id: 1
  }
  element e {
    type: simulation
  }
```

## Options

This rule has no options.

## Related Rules

- [er-no-unclosed-description-block](./er-no-unclosed-description-block.md)
- [requirement-no-empty-description-block](./requirement-no-empty-description-block.md)
- [requirement-no-duplicate-description](./requirement-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/requirement-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/requirement-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
