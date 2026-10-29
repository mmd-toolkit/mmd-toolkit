# @mmd-toolkit/block-no-edge-chain

Japanese version: [block-no-edge-chain.ja.md](./block-no-edge-chain.ja.md)

Disallow an edge statement with more than one link.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

An edge statement links two blocks, as in `A --> B`. mermaid.js accepts
`A --> B --> C` without an error, but keeps only the last link with no start.
Neither intended edge is drawn, and neither `A` nor `B` is placed.

## Rule Details

This rule applies to block diagrams (`block-beta` and `block`). It reports an
edge statement with two or more links, once per statement. A link on the next
line continues the statement, so `A --> B` followed by `--> C` is also reported.

Declaring the blocks beforehand does not prevent a report: the chain still loses
its earlier links. Two separate edge statements, even on one line as
`A --> B B --> C`, are not reported. A chain in a composite head is reported by
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
