# @mmd-toolkit/block-no-edge-in-composite-head

Japanese version:
[block-no-edge-in-composite-head.ja.md](./block-no-edge-in-composite-head.ja.md)

Disallow a link in the head of a composite block.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A composite block is written as `block:G`, its blocks, and `end`. mermaid.js
accepts a link after its id, as in `block:G --> B`, without an error. The
composite loses its id and the link: no block `G` exists, no edge is drawn, and
`B` is not placed.

## Rule Details

This rule applies to block diagrams (`block-beta` and `block`). It reports a
composite head with one or more links, once per head. A label or width does not
prevent a report: `block:G["Group"]:2 --> B` also loses the id and label.

A link on the line after `block:G` belongs to the head too and is reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-edge-in-composite-head: error
block
  block:G --> B
    A
  end
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/block-no-edge-in-composite-head: error
block
  block:G
    A
  end
  G --> B
```

## Options

This rule has no options.

## Related Rules

- [block-no-edge-chain](./block-no-edge-chain.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/block-no-edge-in-composite-head.ts)
- [Tests source](../../tests/rules/block-no-edge-in-composite-head.test.ts)

<!-- end auto-generated rule resources -->
