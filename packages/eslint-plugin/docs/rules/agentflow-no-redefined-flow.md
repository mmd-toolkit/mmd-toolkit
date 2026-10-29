# @mmd-toolkit/agentflow-no-redefined-flow

Japanese version:
[agentflow-no-redefined-flow.ja.md](./agentflow-no-redefined-flow.ja.md)

Disallow a flow declaration that replaces the title written for its id before.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

Declarations of the same flow id are one flow in mermaid.js. Their members are
combined, and a later title replaces the earlier one without an error.

## Rule Details

This rule applies to agentflow diagrams (`agentflow-beta`). It reports a flow
title that differs from the current title of the flow, set by an earlier
declaration of the same id. Declarations with no title, a whitespace-only title,
or the current title are not reported, so a flow can be declared again to add
members.

An unnamed flow has no written title to replace an earlier one. Two unnamed
flows are different flows.

Titles set by data blocks, such as `F@{ label: Review }`, are not compared, even
between declarations.

Titles are compared without whitespace at their ends and otherwise as written,
so differences in character references or HTML attribute quotes can be reported
even when mermaid.js reads them as the same title.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-redefined-flow.ts)
- [Tests source](../../tests/rules/agentflow-no-redefined-flow.test.ts)

<!-- end auto-generated rule resources -->
