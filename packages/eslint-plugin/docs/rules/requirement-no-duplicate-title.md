# @mmd-toolkit/requirement-no-duplicate-title

Japanese version:
[requirement-no-duplicate-title.ja.md](./requirement-no-duplicate-title.ja.md)

Disallow an `accTitle` statement that sets the title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A requirement diagram has one accessible title. mermaid.js accepts every
`accTitle` statement, and each one silently replaces the title set before it. A
second title is usually left over from rewriting the text or from pasting a part
twice.

## Rule Details

This rule reports every `accTitle` statement after the first one, when it sets a
title other than the one before it. It applies to `requirement`.

After `accTitle: a` and `accTitle: b`, the title is `b`. `accTitle:` with no
text on its line takes the next line that holds text as the title, past empty
lines, comment lines, and directives: after `accTitle: a`, the lines `accTitle:`
and `T` give the title `T`, and the second statement is reported. The title of
the frontmatter is another value, and it is not counted.

A statement that sets the title that the diagram already has is not reported:
after `accTitle: a`, a second `accTitle: a` loses nothing. Titles are compared
as mermaid.js keeps them, without the whitespace at their ends, so
`accTitle:  a` sets the same title. After `accTitle: a` and `accTitle: b`, a
third `accTitle: a` is reported, because it replaces `b`.

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
