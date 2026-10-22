# @mmd-toolkit/agentflow-no-duplicate-direction

Japanese version:
[agentflow-no-duplicate-direction.ja.md](./agentflow-no-duplicate-direction.ja.md)

Disallow a `direction` statement that replaces the direction of its flow.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A `direction` statement in a flow sets the direction of the flow. A later one in
the same flow replaces it without an error, and the earlier direction is lost.

## Rule Details

This rule reports a `direction` statement of a flow that gives the flow a
direction other than the one that a `direction` statement gave it before. It
applies to `agentflow`.

In `flow F`, then `direction LR`, `A`, `direction BT`, and `end`, the flow takes
the direction `BT`, and `LR` is lost. Flows of one id are one flow: a
`direction` statement in a later declaration of `F` replaces the direction that
an earlier declaration gave it too. An unnamed flow receives `subGraph` followed
by the number of earlier completed flow declarations, including repeated ids.
Two unnamed flows have different ids; an unnamed flow and a named flow with that
generated id merge, and their directions are compared too. A `direction`
statement counts for the flow whose body it stands in directly, not for a flow
around that one.

A statement that gives the direction that the flow already has is not reported.
`TD` and `TB` are the same direction, top to bottom, as the
[documentation of the flowchart](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/flowchart.md#L100-L100)
of mermaid.js says: after `direction TD`, `direction TB` is not reported.
mermaid.js sets the direction when it reaches the `end` of a flow, so a flow
written inside another one is set first, and its statements are compared in that
order.

Write one `direction` statement for each flow.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-direction: error
agentflow-beta TB
  flow F
    direction LR
    A
    direction BT
  end
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-direction: error
agentflow-beta TB
  flow F
    direction LR
    A
  end
```

## Options

This rule has no options.

## Related Rules

- [agentflow-no-redefined-flow](./agentflow-no-redefined-flow.md)
- [agentflow-no-ignored-text](./agentflow-no-ignored-text.md)

## Background

[`addSubGraph`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1175-L1284)
takes the last `direction` statement of a flow body, and gives the earlier flow
of the same id the direction of a later one.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-duplicate-direction.ts)
- [Tests source](../../tests/rules/agentflow-no-duplicate-direction.test.ts)

<!-- end auto-generated rule resources -->
