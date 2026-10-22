# @mmd-toolkit/agentflow-no-redefined-flow

Japanese version:
[agentflow-no-redefined-flow.ja.md](./agentflow-no-redefined-flow.ja.md)

Disallow a flow declaration that replaces the title written for its id before.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

Flows of one id are one flow in mermaid.js: their members are put together, and
a later title replaces the earlier one without an error.

## Rule Details

This rule reports the title of a flow declaration when it differs from the title
that a declaration of the same id gave the flow before. It applies to
`agentflow`.

After `flow F[First]` with its body and `end`, the declaration `flow F[Second]`
gives the flow the title `Second`, and `First` is lost. A declaration without a
title, or with a title of only whitespace, keeps the title of the flow, and
writing the flow again to add members is not reported. Neither is a declaration
with the title that the flow already has. After `First` and `Second`, a third
`flow F[First]` is reported, because it replaces `Second`. An unnamed flow has
no written title, so it does not replace a title. Its id is `subGraph` followed
by the number of earlier completed flow declarations, including repeated ids.
Two unnamed flows have different ids; an unnamed flow and a named flow with that
generated id merge, keeping any earlier nonempty title.

mermaid.js sets the title when it reaches the `end` of a flow, so a flow written
inside another one is set first. Declarations are compared in that order.

The id of a flow is its name, without the whitespace at its ends and without the
parts that mermaid.js erases from it. A title set by a data block, as in
`F@{ label: Review }`, is not compared, also where it stands between two
declarations. Titles are compared without the whitespace at their ends, which
mermaid.js removes, and otherwise as written: mermaid.js turns character
references, as `#35;`, and the quotes of HTML attributes into other characters
before it reads a title, so two titles that differ only in those may be one
title for mermaid.js and two for this rule.

Give each flow its own id, and write its title once.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-flow: error
agentflow-beta TB
  flow F[First]
    A
  end
  flow F[Second]
    B
  end
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-redefined-flow: error
agentflow-beta TB
  flow F[First]
    A
  end
  flow F
    B
  end
```

## Options

This rule has no options.

## Related Rules

- [agentflow-no-duplicate-direction](./agentflow-no-duplicate-direction.md)

## Background

[`addSubGraph`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1175-L1284)
merges a flow into the earlier flow of its id and replaces the title with a
later one that is not empty; the
[flow statement](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow.jison#L406-L415)
calls it after the `end`.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-redefined-flow.ts)
- [Tests source](../../tests/rules/agentflow-no-redefined-flow.test.ts)

<!-- end auto-generated rule resources -->
