# @mmd-toolkit/block-no-edge-in-composite-head

Japanese version:
[block-no-edge-in-composite-head.ja.md](./block-no-edge-in-composite-head.ja.md)

Disallow a link in the head of a composite block.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A composite block is written as `block:G`, its blocks, and `end`. mermaid.js
also accepts a link after the id, as in `block:G --> B`, without an error, but
the composite then has no id and the link is lost: no block `G` exists, no edge
is drawn, and `B` is not placed.

## Rule Details

This rule reports the head of a composite block that has one or more links, once
for each head. It applies to `block`.

A label or a width in the head does not keep the id: `block:G["Group"]:2 --> B`
also gives a composite with no id and no label. A link on the line after
`block:G` belongs to the head too, as in `block:G` followed by a line `--> B`.
To link the composite, write the edge after its `end`, as in `G --> B`; an edge
between blocks inside the composite is written in its body.

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
