# @mmd-toolkit/flowchart-no-duplicate-direction

Japanese version:
[flowchart-no-duplicate-direction.ja.md](./flowchart-no-duplicate-direction.ja.md)

Disallow a `direction` statement that replaces the direction of its subgraph.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A `direction` statement sets the direction of its subgraph. A later one in the
same subgraph replaces it without an error, and the earlier direction is lost.

## Rule Details

This rule applies to flowcharts (`flowchart`, `graph`, `flowchart-elk`, and
`swimlane-beta`). It reports a `direction` statement that changes the direction
set by an earlier statement in the same subgraph. Statements count for the
subgraph whose body they stand in directly, including direction lines with other
text on them.

mermaid.js draws subgraphs of the same id as one, using the first subgraph's
direction. A direction in a later subgraph of that id is reported when it
differs from the first subgraph's direction, including when the first has no
direction.

Repeating the current direction is not reported, and `TD` and `TB` both mean top
to bottom. Going back to an earlier direction is reported: after `direction LR`
and `direction BT`, a third `direction LR` is reported.

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

## Further Reading

- [Flowchart directions](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/flowchart.md#L100-L100)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/flowchart-no-duplicate-direction.ts)
- [Tests source](../../tests/rules/flowchart-no-duplicate-direction.test.ts)

<!-- end auto-generated rule resources -->
