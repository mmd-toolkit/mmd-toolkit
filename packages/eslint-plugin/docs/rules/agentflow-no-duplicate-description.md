# @mmd-toolkit/agentflow-no-duplicate-description

Japanese version:
[agentflow-no-duplicate-description.ja.md](./agentflow-no-duplicate-description.ja.md)

Disallow an `accDescr` that replaces the description set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

An `agentflow-beta` diagram has one accessible description, which `accDescr`
sets. A later `accDescr` replaces it without an error, and the earlier
description is lost.

## Rule Details

This rule applies to agentflow diagrams (`agentflow-beta`). It reports an
`accDescr` statement that changes a description set by an earlier statement. The
line and block forms are compared together, including statements inside a flow
or a `global` block, which set the description of the whole diagram.

With no text after `accDescr:`, the next line with text supplies the
description, past empty lines and directives; with no such line, the description
becomes empty. Comment lines count as description text, including inside a
block. Empty blocks and unclosed blocks are not counted by this rule.

Repeating the current description is not reported. Comparisons ignore whitespace
at the ends and after each line break, including indentation and empty lines in
blocks, and treat LF, CRLF, and CR as LF. Otherwise descriptions are compared as
written, so differences in character references or HTML attribute quotes can be
reported even when mermaid.js reads them as the same description.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-description: error
agentflow-beta TB
  accDescr: first
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-description: error
agentflow-beta TB
  accDescr: short
  accDescr {
    A longer
    description
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-description: error
agentflow-beta TB
  accDescr {
    A longer
    description
  }
```

## Options

This rule has no options.

## Related Rules

- [agentflow-no-duplicate-title](./agentflow-no-duplicate-title.md)
- [agentflow-no-empty-description-block](./agentflow-no-empty-description-block.md)
- [agentflow-no-unclosed-description-block](./agentflow-no-unclosed-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-duplicate-description.ts)
- [Tests source](../../tests/rules/agentflow-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
