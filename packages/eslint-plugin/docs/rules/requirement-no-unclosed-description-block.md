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
mermaid.js rejects the text.

## Rule Details

This rule reports a description block whose text holds a `{` on a later line
than the `{` of the block. It applies to `requirement`.

Every character up to the first `}`, a `{` too, is the text of the block
([Accessibility values](../../../spec/docs/diagrams/requirement.md#accessibility-values)
in the specification). After `accDescr { x`, the lines `requirement r {`,
`id: 1`, and `}` give the description `x`, `requirement r {`, and `id: 1`, and
no requirement `r`; so it is with the body of an element. A description that
holds a `{` and ends with its own `}` on a later line, as `accDescr {`, then
`uses { here`, and `}`, is reported too: the rule does not tell that `}` from
the `}` of a body, and such a description is rare. A `}` on the line of the `{`,
as in `accDescr { a {b }`, closes the block as written, and is not reported.

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
