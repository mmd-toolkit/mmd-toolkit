# @mmd-toolkit/block-no-undef

Japanese version: [block-no-undef.ja.md](./block-no-undef.ja.md)

Disallow a `class` statement for an id that no block has.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`class A c` gives class `c` to block `A`. When no block has the id, as when it
is misspelled, mermaid.js gives no error. It creates an unplaced block with that
id, leaving the intended block without the class.

## Rule Details

This rule applies to block diagrams (`block-beta` and `block`). It reports each
id in a `class` statement that no statement in the diagram declares, including
repeated references to the same unknown id. Ids are case-sensitive.

Standalone blocks, composite heads, and edges declare blocks anywhere in the
diagram, and `root` is declared from the start. A declaration after the `class`
statement prevents a report, although mermaid.js then leaves the block unplaced.
Blocks lost by an edge chain or a composite head with a link do not count as
declared.

Class names are not checked: a class without a `classDef` can be used by the
page's CSS. Ids starting with whitespace are reported by
[block-no-spaced-class-id](./block-no-spaced-class-id.md).

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-undef: error
block
  A
  classDef c fill:#f00
  class Typo c
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-undef: error
block
  A
  classDef c fill:#f00
  class A c
```

## Options

This rule has no options.

## Related Rules

- [block-no-spaced-class-id](./block-no-spaced-class-id.md)
- [block-no-duplicate-block](./block-no-duplicate-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/block-no-undef.ts)
- [Tests source](../../tests/rules/block-no-undef.test.ts)

<!-- end auto-generated rule resources -->
