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

This rule reports a declaration of an anchor, a component, or a child of a
pipeline that gives a node of the same id other values than an earlier one. It
applies to `wardley`.

After `component API [0.6, 0.7] (build) inertia` and `component API [0.3, 0.8]`,
the map has one node `API`, at the later position, without the overlay of
`build` and without the mark of inertia.

mermaid.js takes the anchors first, then the components, then the children of
the pipelines, whatever their order in the text, so a component replaces an
anchor of its name also where the anchor is written after it, and this rule
compares them in that order. The child `X` of the pipeline `P` has the id `P_X`
and replaces a component named `P_X`. Positions are compared as percentages:
`0.6` and `60.0` are one position. An offset of the label that a later
declaration leaves out keeps the earlier one; a strategy or an inertia left out
does not. The position of the parent of a pipeline along evolution is not
compared, since mermaid.js draws the parent above its children. A declaration
that gives the values that the node already has is not reported. Names are
compared as the rule [wardley-no-undef](./wardley-no-undef.md) compares them.

Give each node its own id, or declare it once.

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

## Background

The
[parser](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyParser.ts#L92-L171)
adds the anchors, the components, and the children of the pipelines in that
order, and
[`addNode`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/wardley/wardleyBuilder.ts#L92-L102)
stores a node over the one of the same id, keeping only its offsets of the
label.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-redefined-node.ts)
- [Tests source](../../tests/rules/wardley-no-redefined-node.test.ts)

<!-- end auto-generated rule resources -->
