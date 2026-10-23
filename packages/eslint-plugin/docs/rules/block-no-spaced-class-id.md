# @mmd-toolkit/block-no-spaced-class-id

Japanese version:
[block-no-spaced-class-id.ja.md](./block-no-spaced-class-id.ja.md)

Disallow whitespace around a comma in the ids of a `class` statement.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`class A,B c` gives the class `c` to the blocks `A` and `B`. mermaid.js looks up
each id as it is written between the commas, whitespace included, so in
`class A, B c` it looks for the id ` B` and finds no block: it makes a new block
`B` that is not placed, and the block `B` of the diagram gets no class, without
an error.

## Rule Details

This rule reports an id of a `class` statement that starts with whitespace, and
the name of the class when it starts with a comma. It applies to `block`.

Whitespace before a comma ends the ids: in `class A ,B c`, the only id is `A`,
and the rest of the line, `,B c`, is the name of the class. The block `A` gets
the class `,B c`, which no `classDef` defines, and neither block gets the class
`c`.

A space, a tab, or a line break after the comma has the same effect, also before
`root`. A directive between the comma and the id is removed, and
`class A,%%{init: {}}%%B c` gives the class to both blocks, while whitespace
after the directive starts the id, as in `class A,%%{init: {}}%% B c`, and is
reported. Write the ids without whitespace around the commas, as the
documentation of mermaid.js writes them: `class Backend,Database back`.

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
