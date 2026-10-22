# @mmd-toolkit/agentflow-no-duplicate-title

Japanese version:
[agentflow-no-duplicate-title.ja.md](./agentflow-no-duplicate-title.ja.md)

Disallow an `accTitle` that replaces the title set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

An agentflow has one accessible title, which `accTitle` sets. A later `accTitle`
replaces the title set before it without an error, and the earlier title is
lost.

## Rule Details

This rule reports every `accTitle` statement after the first one, when it sets a
title other than the one before it. It applies to `agentflow`.

After `accTitle: first` and `accTitle: second`, the title is `second`.
`accTitle:` with no text sets the title too: it takes the next line that holds
text as the title, past empty lines and directives, and when no such line
follows, it makes the title empty. A comment line is text there: after
`accTitle:`, the line `%% next` is the title `%% next`. Either way, a title
written before it is lost. A statement inside a flow or a `global` block sets
the title of the whole diagram and is counted too; mermaid.js also adds the
value of such a statement inside a flow to the members of the flow as an id, so
that a vertex with that id belongs to the flow.

A statement that sets the title that the diagram already has is not reported:
after `accTitle: a`, a second `accTitle: a` loses nothing. Titles are compared
without the whitespace at their ends, which mermaid.js removes, so
`accTitle:  a` sets the same title. After `accTitle: a` and `accTitle: b`, a
third `accTitle: a` is reported, because it replaces `b`. Titles are otherwise
compared as written: mermaid.js turns character references, as `#35;`, and the
quotes of HTML attributes into other characters before it reads a title, so two
titles that differ only in those may be one title for mermaid.js and two for
this rule.

Keep one `accTitle` statement.

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

## Background

The
[`accTitle` statement](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow.jison#L426-L426)
calls the common `setAccTitle`, which replaces the title set before it, and
returns its value, which a flow takes as a member.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-duplicate-title.ts)
- [Tests source](../../tests/rules/agentflow-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
