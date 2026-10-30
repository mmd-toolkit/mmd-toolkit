# @mmd-toolkit/agentflow-no-empty-description-block

Japanese version:
[agentflow-no-empty-description-block.ja.md](./agentflow-no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

An `accDescr` block is written to give the diagram a description. mermaid.js
accepts a closed block with nothing in it without an error, but it sets no
description.

## Rule Details

This rule applies to agentflow diagrams (`agentflow-beta`). It reports a closed
`accDescr` block containing nothing or only whitespace. Directives do not count
as text, so a block containing only directives is reported, although mermaid.js
applies their settings.

A comment line counts as description text, so a block containing one is not
empty.

Empty blocks are also reported after a statement or the header, in a flow or
connector name, or before the URL or tooltip of a `click` statement.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-empty-description-block: error
agentflow-beta TB
  A
  accDescr {
  }
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-empty-description-block: error
agentflow-beta TB
  flow F accDescr {}
    A
  end
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-empty-description-block: error
agentflow-beta TB
  A
  accDescr {
    The steps of the review
  }
```

## Options

This rule has no options.

## Related Rules

- [agentflow-no-duplicate-description](./agentflow-no-duplicate-description.md)
- [agentflow-no-unclosed-description-block](./agentflow-no-unclosed-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-empty-description-block.ts)
- [Tests source](../../tests/rules/agentflow-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
