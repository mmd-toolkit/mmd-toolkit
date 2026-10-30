# @mmd-toolkit/block-no-redefined-style

Japanese version:
[block-no-redefined-style.ja.md](./block-no-redefined-style.ja.md)

Disallow a `style` statement that loses a style of an earlier one.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

`style` gives a block a list of styles. mermaid.js accepts another `style` for
the block without an error and replaces the whole list. A later stroke can
therefore remove an earlier fill.

## Rule Details

This rule applies to block diagrams (`block-beta` and `block`). It reports a
`style` statement whose list omits a style that the block currently has.
Reordering or adding styles is not reported.

A `style` with nothing after the id changes nothing and is not compared.
`style A ,` after `style A fill:#f00` is reported, because its empty parts
replace the fill. Comparisons ignore whitespace at the ends and around the
colon, and treat a run of whitespace in a value as one space. Other spellings
are compared as written, so `fill:#F00` after `fill:#f00` is reported.

Statements for the same block are compared across composite blocks. The styles
of a `classDef` are not compared.

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
