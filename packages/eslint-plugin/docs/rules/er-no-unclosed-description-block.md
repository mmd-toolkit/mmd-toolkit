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
gives an error.

## Rule Details

This rule applies to entity relationship diagrams (`erDiagram`). It reports a
description block with a `{` in its text on a later line than the opening `{`.
It also reports a description that intentionally contains that `{` and has its
own closing `}`: the rule cannot tell its `}` from the `}` of an attribute
block.

A block whose closing `}` is on the opening line is not reported, even if that
line contains another `{`. A block with a `{` on a later line is reported also
when its closing `}` stands alone on its line, as the end of an attribute block
does.

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
