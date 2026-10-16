# @mmd-toolkit/er-no-unclosed-description-block

Japanese version:
[er-no-unclosed-description-block.ja.md](./er-no-unclosed-description-block.ja.md)

Disallow an `accDescr {` block that a `}` written for something else closes.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A description block ends at the first `}` after its `{`. When the `}` of the
block is missing and a later statement holds a `}`, as the attribute block of an
entity does, mermaid.js closes the description block there and reads the lines
up to it as the description, without an error. When no `}` follows, mermaid.js
rejects the text.

## Rule Details

This rule reports a description block whose text holds a `{` on a later line
than the `{` of the block. It applies to `er`.

Every character up to the first `}`, a `{` too, is the text of the block
([Accessibility values](../../../spec/docs/diagrams/er.md#accessibility-values)
in the specification). After `accDescr { x`, the lines `A {`, `string name`, and
`}` give the description `x`, `A {`, and `string name`, and no entity `A`. The
block is reported also where the `}` that closes it stands alone on its line, as
the `}` of an attribute block does. A description that holds a `{` and ends with
its own `}` on a later line, as `accDescr {`, then `uses { here`, and `}`, is
reported too: the rule does not tell that `}` from the `}` of an attribute
block, and such a description is rare. A `}` on the line of the `{`, as in
`accDescr { a { b }`, closes the block as written, and is not reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/er-no-unclosed-description-block: error
erDiagram
  accDescr { x
  A {
    string name
  }
  B
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/er-no-unclosed-description-block: error
erDiagram
  accDescr { x }
  A {
    string name
  }
  B
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.md)
- [er-no-empty-description-block](./er-no-empty-description-block.md)
- [er-no-duplicate-description](./er-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/er-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/er-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
