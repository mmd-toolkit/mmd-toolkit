# @mmd-toolkit/requirement-no-duplicate-title

Japanese version:
[requirement-no-duplicate-title.ja.md](./requirement-no-duplicate-title.ja.md)

Disallow an `accTitle` statement that sets the title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A diagram has one accessible title. When another `accTitle` statement sets it,
mermaid.js uses the later title without an error, and the earlier one is lost.

## Rule Details

This rule applies to requirement diagrams (`requirementDiagram`). It reports an
`accTitle` statement that replaces the current title with a different one. A
statement that repeats the current title is not reported. Titles are compared
without the whitespace at their ends.

An `accTitle:` with no text on its line also sets the title and is counted: it
takes the next line that holds text, past empty lines, comment lines, and
directives. The frontmatter title is a separate value and is not counted.

After `accTitle: a` and `accTitle: b`, a third `accTitle: a` is reported because
it replaces `b`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-title: error
requirementDiagram
  accTitle: first
  accTitle: second
  requirement r {
    id: 1
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-title: error
requirementDiagram
  accTitle: first
  accDescr: second
  requirement r {
    id: 1
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-title: error
requirementDiagram
  accTitle: first
  accTitle: first
  requirement r {
    id: 1
  }
```

## Options

This rule has no options.

## Related Rules

- [er-no-duplicate-title](./er-no-duplicate-title.md)
- [requirement-no-duplicate-description](./requirement-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/requirement-no-duplicate-title.ts)
- [Tests source](../../tests/rules/requirement-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
