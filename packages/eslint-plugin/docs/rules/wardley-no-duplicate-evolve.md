# @mmd-toolkit/wardley-no-duplicate-evolve

Japanese version:
[wardley-no-duplicate-evolve.ja.md](./wardley-no-duplicate-evolve.ja.md)

Disallow an `evolve` that replaces the target of an earlier `evolve` of the same
node.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A node has one arrow of evolution. When a later `evolve` gives the node another
target, mermaid.js draws only the arrow to the later target without an error,
and the earlier target is lost.

## Rule Details

This rule reports an `evolve` that gives a node another target than the `evolve`
of the same node before it. It applies to `wardley`.

After `evolve API 0.6` and `evolve API 0.9`, the map has one arrow, to 90.

An `evolve` that gives the target that the node already has is not reported.
Targets are compared as percentages: `0.9` and `90.0` are one target. A node
declared after the `evolve` counts. An `evolve` of a name that is the id of no
node draws nothing and is reported by [wardley-no-undef](./wardley-no-undef.md)
instead. Names are compared as that rule compares them.

Give each node one `evolve`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-evolve: error
wardley-beta
  component API [0.3, 0.4]
  evolve API 0.6
  evolve API 0.9
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-evolve: error
wardley-beta
  component API [0.3, 0.4]
  evolve API 0.9
```

## Options

This rule has no options.

## Related Rules

- [wardley-no-undef](./wardley-no-undef.md)

## Background

[`addTrend`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyBuilder.ts#L108-L110)
stores the arrow of a node over the one stored before.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-duplicate-evolve.ts)
- [Tests source](../../tests/rules/wardley-no-duplicate-evolve.test.ts)

<!-- end auto-generated rule resources -->
