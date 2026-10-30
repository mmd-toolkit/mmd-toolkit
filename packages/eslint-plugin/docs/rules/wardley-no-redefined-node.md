# @mmd-toolkit/wardley-no-redefined-node

Japanese version:
[wardley-no-redefined-node.ja.md](./wardley-no-redefined-node.ja.md)

Disallow a node declared again with other values.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A Wardley map has one node for each id. A node declared again does not add a
second node: mermaid.js replaces the position, the strategy, and the inertia of
the earlier declaration without an error, and the earlier values are lost.

## Rule Details

This rule applies to Wardley maps (`wardley-beta`). It reports an anchor,
component, or pipeline child declaration that gives a node values different from
the ones it has from the declarations before it. mermaid.js takes anchors first,
then components, then pipeline children, whatever their order in the text, so
when an anchor and a component share an id, the component is reported even where
it is written before the anchor. A pipeline child `X` of `P` has the id `P_X`
and replaces a component named `P_X`.

Positions are compared as percentages, so `0.6` and `60.0` are the same
position. A later declaration that leaves out a label offset keeps the earlier
offset and is not reported for it, but one that leaves out a strategy or inertia
given before is reported. The evolution position of a pipeline parent is not
compared, because mermaid.js draws the parent above its children.

A declaration repeating the node's current values is not reported. Names are
compared as [wardley-no-undef](./wardley-no-undef.md) compares them.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-redefined-node: error
wardley-beta
  component API [0.6, 0.7] (build) inertia
  component API [0.3, 0.8]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-redefined-node: error
wardley-beta
  component API [0.6, 0.7] (build) inertia
  component Database [0.3, 0.8]
```

## Options

This rule has no options.

## Related Rules

- [wardley-no-undef](./wardley-no-undef.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-redefined-node.ts)
- [Tests source](../../tests/rules/wardley-no-redefined-node.test.ts)

<!-- end auto-generated rule resources -->
