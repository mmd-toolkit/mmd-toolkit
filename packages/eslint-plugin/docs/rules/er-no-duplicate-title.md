# @mmd-toolkit/er-no-duplicate-title

Japanese version: [er-no-duplicate-title.ja.md](./er-no-duplicate-title.ja.md)

Disallow an `accTitle` statement that sets the title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A diagram has one accessible title. mermaid.js accepts every `accTitle`
statement, and each one silently replaces the title set before it. A second
title is usually left over from rewriting the text or from pasting a part twice.

## Rule Details

This rule reports every `accTitle` statement after the first one. It applies to
`er`.

After `accTitle: a` and `accTitle: b`, the title is `b`. `accTitle:` with no
text on its line takes the next line that holds text as the title, past empty
lines, comment lines, and directives; at the end of the text, mermaid.js rejects
it. A statement inside a subgraph sets the title of the whole diagram and is
counted too; mermaid.js also adds its text to the members of the subgraph.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-title: error
erDiagram
  accTitle: first
  accTitle: second
  A
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-title: error
erDiagram
  accTitle: first
  accDescr: second
  A
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.md)
- [er-no-duplicate-description](./er-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/er-no-duplicate-title.ts)
- [Tests source](../../tests/rules/er-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
