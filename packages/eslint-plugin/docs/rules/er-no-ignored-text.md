# @mmd-toolkit/er-no-ignored-text

Japanese version: [er-no-ignored-text.ja.md](./er-no-ignored-text.ja.md)

Disallow text that mermaid.js does not read.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A `direction` statement is written on a line of its own. When the line also
holds other text, mermaid.js reads the whole line as the direction statement and
drops the rest without an error.

## Rule Details

This rule reports text that mermaid.js does not read. It applies to `er`.

`A ||--o{ B : x direction LR` sets the direction `LR` and makes no entity and no
relationship. `direction LR x` sets the direction `LR`, and the `x` is dropped.
A line becomes a direction statement also when it is not meant as one: in
`A ||--o{ B : direction TB`, whose role holds the word `direction`, there is no
relationship.

Text after the direction that starts with `%%`, as in `direction LR %% c`, is
not reported. The author means it as a comment, and mermaid.js drops it, as the
author intended.

The rule also reports empty backquotes, two backquotes with nothing between
them, in the attribute block of an entity: between two attributes, before the
first, after the last, or alone in the block. mermaid.js skips them. A run of
them with only whitespace, comment lines, or directives between them is one
report.

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
