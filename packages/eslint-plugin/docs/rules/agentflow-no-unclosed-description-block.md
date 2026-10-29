# @mmd-toolkit/agentflow-no-unclosed-description-block

Japanese version:
[agentflow-no-unclosed-description-block.ja.md](./agentflow-no-unclosed-description-block.ja.md)

Disallow an `accDescr {` block that is not closed by `}`.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

An `accDescr {` block runs to its `}`. Without one, mermaid.js reads the rest of
the text as the block without an error: later statements disappear, and the
description becomes empty.

## Rule Details

This rule applies to agentflow diagrams (`agentflow-beta`). It reports an
`accDescr {` block with no closing `}`. Inside a flow, such a block also takes
the `end` of the flow, and mermaid.js gives an error, so the rule does not
report it.

It also reports a closed block containing a `{` on a later line than its opening
`{`, unless only whitespace and directives precede its closing `}` on that line.
The first `}` closes a description block, so a later shape or data block can
supply the closer by mistake. A `}` on the line of the opening `{`, as in
`accDescr { a { b }`, closes the block as written and is not reported.

A description that intentionally includes a `{` on a later line is also reported
when its closer does not meet that exception: the rule cannot distinguish it
from a shape.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-unclosed-description-block: error
agentflow-beta TB
  A --> B
  accDescr { x
  B --> C
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-unclosed-description-block: error
agentflow-beta TB
  accDescr { first
  B --> C
  A{y}
  D
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-unclosed-description-block: error
agentflow-beta TB
  A --> B
  accDescr { x }
  B --> C
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-unclosed-description-block: error
agentflow-beta TB
  accDescr {
    uses { here
  }
  A
```

## Options

This rule has no options.

## Related Rules

- [agentflow-no-empty-description-block](./agentflow-no-empty-description-block.md)
- [agentflow-no-duplicate-description](./agentflow-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/agentflow-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
