# @mmd-toolkit/state-no-duplicate-title

Japanese version:
[state-no-duplicate-title.ja.md](./state-no-duplicate-title.ja.md)

Disallow an `accTitle` statement that sets the title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A diagram has one accessible title. mermaid.js accepts every `accTitle`
statement, and each one silently replaces the title set before it. A second
title is usually left over from rewriting the text or from pasting a part twice.

## Rule Details

This rule reports every `accTitle` statement after the first one. It applies to
`stateDiagram`.

After `accTitle: first` and `accTitle: second`, the title is `second`.
`accTitle:` with no text sets the title too: it takes the next line that holds
text as the title, past empty lines, comment lines, and directives, and when no
such line follows, it makes the title empty.

Inside a composite state, `accTitle: x` is no `accTitle` statement: mermaid.js
reads it as a state `accTitle` with the description `x`, and the rule does not
count it.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-title: error
stateDiagram-v2
  accTitle: first
  accTitle: second
  A --> B
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-title: error
stateDiagram-v2
  accTitle: first
  accDescr: second
  A --> B
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.md)
- [state-no-duplicate-description](./state-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/state-no-duplicate-title.ts)
- [Tests source](../../tests/rules/state-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
