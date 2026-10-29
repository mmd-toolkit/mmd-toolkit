# @mmd-toolkit/er-no-duplicate-description

Japanese version:
[er-no-duplicate-description.ja.md](./er-no-duplicate-description.ja.md)

Disallow an `accDescr` statement that sets the description again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A diagram has one description. When another `accDescr` statement sets it,
mermaid.js uses the later description without an error, and the earlier one is
lost.

## Rule Details

This rule applies to entity relationship diagrams (`erDiagram`). It reports an
`accDescr:` statement or a description block that replaces the current
description with a different one. A statement that repeats the current
description is not reported, even when the two forms are mixed.

Descriptions are compared without the whitespace at their ends or after each
line break, so indentation and empty lines in a block do not count. LF, CRLF,
and CR line breaks are compared as LF. After `accDescr: a` and `accDescr: b`, a
third `accDescr: a` is reported because it replaces `b`.

An `accDescr:` with no text on its line also sets the description and is
counted: it takes the next line that holds text. At the end of the text,
mermaid.js gives an error. A statement inside a subgraph sets the description of
the whole diagram and is counted too. A block with no description, including one
with only comments or directives, is not counted.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-description: error
erDiagram
  accDescr: first
  accDescr: second
  A
```

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-description: error
erDiagram
  accDescr: first
  accDescr { second }
  A
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-description: error
erDiagram
  accTitle: first
  accDescr: second
  A
```

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-description: error
erDiagram
  accDescr: first
  accDescr {
    first
  }
  A
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.md)
- [er-no-duplicate-title](./er-no-duplicate-title.md)
- [er-no-empty-description-block](./er-no-empty-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/er-no-duplicate-description.ts)
- [Tests source](../../tests/rules/er-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
