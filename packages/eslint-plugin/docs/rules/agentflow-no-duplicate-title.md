# @mmd-toolkit/agentflow-no-duplicate-title

Japanese version:
[agentflow-no-duplicate-title.ja.md](./agentflow-no-duplicate-title.ja.md)

Disallow an `accTitle` that replaces the title set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

An `agentflow-beta` diagram has one accessible title, which `accTitle` sets. A
later `accTitle` replaces it without an error, and the earlier title is lost.

## Rule Details

This rule applies to agentflow diagrams (`agentflow-beta`). It reports an
`accTitle` statement that changes a title set by an earlier statement.
Statements inside a flow or a `global` block set the title of the whole diagram
and count too.

With no text after `accTitle:`, the next line with text supplies the title, past
empty lines and directives; with no such line, the title becomes empty. A
comment line counts as title text there.

Repeating the current title is not reported. Titles are compared without
whitespace at their ends and otherwise as written, so differences in character
references or HTML attribute quotes can be reported even when mermaid.js reads
them as the same title.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-title: error
agentflow-beta TB
  accTitle: first
  accTitle: second
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-title: error
agentflow-beta TB
  A
  accTitle: x
  accTitle:
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-title: error
agentflow-beta TB
  flow F
    A
    accTitle: inner
  end
  accTitle: outer
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-title: error
agentflow-beta TB
  A
  accTitle: first
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-title: error
agentflow-beta TB
  A
  accTitle: first
  accTitle: first
```

## Options

This rule has no options.

## Related Rules

- [agentflow-no-duplicate-description](./agentflow-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-duplicate-title.ts)
- [Tests source](../../tests/rules/agentflow-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
