# @mmd-toolkit/er-no-ignored-text

Japanese version: [er-no-ignored-text.ja.md](./er-no-ignored-text.ja.md)

Disallow text that mermaid.js drops.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A `direction` statement is written on a line of its own. When the line also
holds other text, mermaid.js reads the whole line as the direction statement and
drops the rest without an error.

## Rule Details

This rule applies to entity relationship diagrams (`erDiagram`). It reports text
on a `direction` line before `direction` or after its value. Text after the
value that starts with `%%` is not reported: the author means it as a comment,
and mermaid.js drops it as meant. A relationship whose role contains
`direction`, as in `A ||--o{ B : direction TB`, is reported too: mermaid.js
reads it as a direction line and draws no relationship.

The rule also reports empty backquotes, two backquotes with nothing between
them, anywhere in the attribute block of an entity: mermaid.js skips them. A run
of empty backquotes separated only by whitespace, comment lines, or directives
gives one report.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/er-no-ignored-text: error
erDiagram
  A ||--o{ B : x direction LR
```

```mmd
%% eslint @mmd-toolkit/er-no-ignored-text: error
erDiagram
  direction LR x
  A
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/er-no-ignored-text: error
erDiagram
  direction LR
  A ||--o{ B : x
```

```mmd
%% eslint @mmd-toolkit/er-no-ignored-text: error
erDiagram
  direction LR %% c
  A
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-ignored-text](./flowchart-no-ignored-text.md)
- [class-no-ignored-text](./class-no-ignored-text.md)
- [state-no-ignored-text](./state-no-ignored-text.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/er-no-ignored-text.ts)
- [Tests source](../../tests/rules/er-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
