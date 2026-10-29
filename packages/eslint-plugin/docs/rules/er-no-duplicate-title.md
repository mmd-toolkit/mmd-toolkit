# @mmd-toolkit/er-no-duplicate-title

Japanese version: [er-no-duplicate-title.ja.md](./er-no-duplicate-title.ja.md)

Disallow an `accTitle` statement that sets the title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A diagram has one accessible title. When another `accTitle` statement sets it,
mermaid.js uses the later title without an error, and the earlier one is lost.

## Rule Details

This rule applies to entity relationship diagrams (`erDiagram`). It reports an
`accTitle` statement that replaces the current title with a different one. A
statement that repeats the current title is not reported. Titles are compared
without the whitespace at their ends.

An `accTitle:` with no text on its line also sets the title and is counted: it
takes the next line that holds text, past empty lines, comment lines, and
directives. At the end of the text, mermaid.js gives an error. A statement
inside a subgraph sets the title of the whole diagram and is counted too.

After `accTitle: a` and `accTitle: b`, a third `accTitle: a` is reported because
it replaces `b`.

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

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-title: error
erDiagram
  accTitle: first
  accTitle: first
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
