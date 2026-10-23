# @mmd-toolkit/xychart-no-unclosed-description-block

Japanese version:
[xychart-no-unclosed-description-block.ja.md](./xychart-no-unclosed-description-block.ja.md)

Disallow a description block that is not closed by `}`.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js accepts a description block whose `}` is missing: the block runs to
the end of the text and takes every statement after it as its text, and the
description is then empty, whatever the block holds.

## Rule Details

This rule reports an `accDescr {` block that is not closed by `}`. It applies to
`xychart`.

After `accDescr { Monthly sales`, the lines `title Sales` and `line [1, 2]` give
no title and no plot, and the description is empty. A description written before
the block is replaced by the empty one: after `accDescr: d`, the lines
`accDescr {` and `e` give the empty description. A block that is not closed with
nothing in it, as `accDescr {` at the end of the text, is reported too.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/xychart-no-unclosed-description-block: error
xychart
  accDescr { Monthly sales
  title Sales
  line [1, 2]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/xychart-no-unclosed-description-block: error
xychart
  accDescr { Monthly sales }
  title Sales
  line [1, 2]
```

## Options

This rule has no options.

## Related Rules

- [xychart-no-duplicate-description](./xychart-no-duplicate-description.md)
- [xychart-no-empty-description-block](./xychart-no-empty-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/xychart-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/xychart-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
