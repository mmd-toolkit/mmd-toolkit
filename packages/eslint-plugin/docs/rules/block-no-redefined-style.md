# @mmd-toolkit/block-no-redefined-style

Japanese version:
[block-no-redefined-style.ja.md](./block-no-redefined-style.ja.md)

Disallow a `style` statement that loses a style of an earlier one.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`style A fill:#f00` gives the block `A` its styles. mermaid.js accepts a second
`style` for the same block without an error, and it replaces the whole list:
after `style A fill:#f00` and `style A stroke:#00f`, the block has only the
stroke, and the fill is lost.

## Rule Details

This rule reports a `style` statement for a block when a style of the list that
the block has is not in its list. It applies to `block`.

A list that repeats the styles in another order, or adds styles, loses nothing
and is not reported. A `style` with nothing after the id changes nothing and is
not compared, while a list of empty parts, as `style A ,`, replaces the styles
with empty ones and is reported. Styles are compared as CSS reads their
whitespace: without the whitespace at their ends and around the colon, and with
a run of whitespace inside a value as one space. So `fill: #f00` is the style
`fill:#f00`, `border:1px  solid red` is `border:1px solid red`, and
`style A fill:#f00, stroke:#00f` followed by `style A fill:#f00,stroke:#00f` is
not reported. Other spellings are compared as written: `fill:#F00` after
`fill:#f00` is reported. The `style` statements of a block are compared wherever
they stand, also inside a composite block; the styles of a `classDef` are not
compared.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-redefined-style: error
block
  A
  style A fill:#f00
  style A stroke:#00f
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-redefined-style: error
block
  A
  style A fill:#f00,stroke:#00f
```

## Options

This rule has no options.

## Related Rules

- [block-no-duplicate-block](./block-no-duplicate-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/block-no-redefined-style.ts)
- [Tests source](../../tests/rules/block-no-redefined-style.test.ts)

<!-- end auto-generated rule resources -->
