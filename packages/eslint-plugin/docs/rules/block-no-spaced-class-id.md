# @mmd-toolkit/block-no-spaced-class-id

Japanese version:
[block-no-spaced-class-id.ja.md](./block-no-spaced-class-id.ja.md)

Disallow whitespace around a comma in the ids of a `class` statement.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

`class A,B c` gives class `c` to both blocks. mermaid.js reads whitespace after
a comma as part of the next id, so `class A, B c` leaves the intended `B`
without the class. It gives no error for the misplaced whitespace.

## Rule Details

This rule applies to block diagrams (`block-beta` and `block`). It reports an id
in a `class` statement that starts with whitespace, and a class name that starts
with a comma.

Whitespace before a comma ends the ids: in `class A ,B c`, only `A` is an id,
and the class name `,B c` is reported. Spaces, tabs, and line breaks after a
comma are reported, including before `root`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-spaced-class-id: error
block
  A B
  classDef c fill:#f00
  class A, B c
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-spaced-class-id: error
block
  A B
  classDef c fill:#f00
  class A,B c
```

## Options

This rule has no options.

## Related Rules

- [block-no-undef](./block-no-undef.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/block-no-spaced-class-id.ts)
- [Tests source](../../tests/rules/block-no-spaced-class-id.test.ts)

<!-- end auto-generated rule resources -->
