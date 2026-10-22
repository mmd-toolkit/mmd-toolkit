# @mmd-toolkit/flowchart-no-duplicate-direction

Japanese version:
[flowchart-no-duplicate-direction.ja.md](./flowchart-no-duplicate-direction.ja.md)

Disallow a `direction` statement that replaces the direction of its subgraph.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A `direction` statement in a subgraph sets the direction of the subgraph. A
later one in the same subgraph replaces it without an error, and the earlier
direction is lost.

## Rule Details

This rule reports a `direction` statement of a subgraph that gives the subgraph
a direction other than the one that a `direction` statement before it in the
same subgraph gave. It applies to `flowchart-v2`, `flowchart-elk`, and
`swimlane`.

In `subgraph S`, then `direction LR`, `A`, `direction BT`, and `end`, the
subgraph takes the direction `BT`, and `LR` is lost. A `direction` statement
counts for the subgraph whose body it stands in directly, not for a subgraph
around that one. mermaid.js draws two subgraphs of one id as one, with the
direction of the first of them: a `direction` statement in a later subgraph of
the id is lost when it gives a direction other than the one that the first
subgraph has, also when the first one has none, and it is reported. A line that
holds `direction` and a direction value is a direction statement also where
other text stands on it, as `A-->B; direction BT`, and it is compared as well;
[flowchart-no-ignored-text](./flowchart-no-ignored-text.md) reports the other
text.

A statement that gives the direction that the subgraph already has is not
reported. `TD` and `TB` are the same direction, top to bottom, as the
[documentation of mermaid.js](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/flowchart.md#L100-L100)
says: after `direction TD`, `direction TB` is not reported. After `direction LR`
and `direction BT`, a third `direction LR` is reported, because it replaces
`BT`.

Write one `direction` statement for each subgraph.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-direction: error
flowchart TB
  subgraph S
    direction LR
    A --> B
    direction BT
  end
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-direction: error
flowchart TB
  subgraph S
    direction LR
    A --> B
  end
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-ignored-text](./flowchart-no-ignored-text.md)

## Background

[`addSubGraph`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L674-L746)
takes the last `direction` statement of the body of a subgraph as its direction.
[`getData`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L1210-L1255)
gives the layout the subgraphs from the last to the first, and the layout keeps
one node for an id, the one given last.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/flowchart-no-duplicate-direction.ts)
- [Tests source](../../tests/rules/flowchart-no-duplicate-direction.test.ts)

<!-- end auto-generated rule resources -->
