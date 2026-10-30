# @mmd-toolkit/eventmodeling-no-duplicate-title

Japanese version:
[eventmodeling-no-duplicate-title.ja.md](./eventmodeling-no-duplicate-title.ja.md)

Disallow an `accTitle` that replaces the accessible title set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

An Event Modeling diagram has one accessible title, which `accTitle` sets. A
later `accTitle` replaces the title set before it without an error, and the
earlier title is lost.

## Rule Details

This rule applies to Event Modeling diagrams (`eventmodeling`). It reports an
`accTitle` whose text differs from the preceding `accTitle`, when the preceding
text is not empty. mermaid.js keeps the whole statement, including `accTitle:`,
as the accessible title, so even an empty or whitespace-only `accTitle:` sets a
title. It is reported after `accTitle: First`, but a statement after an
`accTitle:` with no text is not reported, because no text is lost.

A repeated `title` statement is not reported, because mermaid.js does not draw
the title of an Event Modeling diagram.

Texts are compared without whitespace at their ends and with a run of two or
more spaces or tabs as one space. A statement that repeats the text of the
preceding `accTitle` is not reported. Going back to an earlier title is
reported: after `accTitle: a` and `accTitle: b`, a third `accTitle: a` is
reported. Texts are otherwise compared as written. mermaid.js converts character
references such as `#35;` and HTML attribute quotes before reading a title, so
texts differing only in these ways may be the same for mermaid.js and different
for this rule.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-duplicate-title: error
eventmodeling accTitle: First
  tf 01 evt Bought accTitle: Second
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/eventmodeling-no-duplicate-title: error
eventmodeling accTitle: Second
  tf 01 evt Bought
```

## Options

This rule has no options.

## Related Rules

- [eventmodeling-no-duplicate-description](./eventmodeling-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/eventmodeling-no-duplicate-title.ts)
- [Tests source](../../tests/rules/eventmodeling-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
