# @mmd-toolkit/agentflow-no-duplicate-direction

Japanese version:
[agentflow-no-duplicate-direction.ja.md](./agentflow-no-duplicate-direction.ja.md)

Disallow a `direction` statement that replaces the direction of its flow.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A `direction` statement sets the direction of its flow. A later one in the same
flow replaces it without an error, and the earlier direction is lost.

## Rule Details

This rule applies to agentflow diagrams (`agentflow-beta`). It reports a
`direction` statement that changes the direction set by an earlier statement for
the same flow. Statements count for the flow whose body they stand in directly.

Declarations with the same id are one flow, so their directions are compared
too. Two unnamed flows are different flows, and their directions are not
compared.

Repeating the current direction is not reported, and `TD` and `TB` both mean top
to bottom.

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

## Further Reading

- [Flowchart directions](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/flowchart.md#L100-L100)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-duplicate-direction.ts)
- [Tests source](../../tests/rules/agentflow-no-duplicate-direction.test.ts)

<!-- end auto-generated rule resources -->
