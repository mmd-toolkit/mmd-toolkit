# @mmd-toolkit/block-no-undef

Japanese version: [block-no-undef.ja.md](./block-no-undef.ja.md)

Disallow a `class` statement for an id that no block has.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`class A c` gives the class `c` to the block `A`. When no block of the diagram
has the id, as when it is misspelled, mermaid.js gives no error: it makes a new
block of that id, which is not placed, and the class goes to no block of the
diagram.

## Rule Details

This rule reports an id of a `class` statement that no statement of the diagram
declares. It applies to `block`.

A block is declared by a block written on its own, by the head of a composite
block, and by an edge, anywhere in the diagram, inside or outside a composite
block; `root`, the id of the diagram, is declared from the start. An id that is
declared only after the `class` statement is not reported either, although
mermaid.js does not place that block: the class statement makes the block first,
and the later declaration then places nothing. That is decided as for
`class A foo` before the vertex `A` in a flowchart, which looks like a defect of
mermaid.js, and no rule reports it. Ids are compared with their case, so
`class a c` does not reach the block `A`. A block that a chain or a composite
head with a link loses is not declared: after `A --> B --> C`, `class A c` is
reported. Each id of a list is checked, and each statement for the same id is
reported.

The name of the class is not checked: a class that no `classDef` defines stays
on the block as a CSS class, which the styles of the page can use. An id that
starts with whitespace is reported by
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
