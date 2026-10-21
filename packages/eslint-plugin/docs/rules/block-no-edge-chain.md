# @mmd-toolkit/block-no-edge-chain

Japanese version: [block-no-edge-chain.ja.md](./block-no-edge-chain.ja.md)

Disallow an edge statement with more than one link.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

In a block diagram, an edge statement links two blocks, as in `A --> B`.
mermaid.js also accepts a chain of links, as in `A --> B --> C`, without an
error, but it keeps only the last link, and that link has no start: the chain
draws no edge from `A` to `B` and no edge from `B` to `C`, and it places neither
`A` nor `B`.

## Rule Details

This rule reports an edge statement with two or more links, once for each
statement. It applies to `block`.

A chain loses its earlier links also when the blocks were placed before it:
after `A B C`, the chain `A --> B --> C` draws one edge into `C` with no start.
A link written on the next line continues the statement, so `A --> B` followed
by a line `--> C` is a chain too. Two edge statements, on two lines or on one
line, as in `A --> B B --> C`, draw both edges.

A chain in the head of a composite block is reported by
[block-no-edge-in-composite-head](./block-no-edge-in-composite-head.md).

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-edge-chain: error
block
  A --> B --> C
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-edge-chain: error
block
  A --> B
  B --> C
```

## Options

This rule has no options.

## Related Rules

- [block-no-edge-in-composite-head](./block-no-edge-in-composite-head.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/block-no-edge-chain.ts)
- [Tests source](../../tests/rules/block-no-edge-chain.test.ts)

<!-- end auto-generated rule resources -->
