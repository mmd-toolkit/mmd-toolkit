# @mmd-toolkit/quadrant-no-duplicate-title

Japanese version:
[quadrant-no-duplicate-title.ja.md](./quadrant-no-duplicate-title.ja.md)

Disallow a `title` or `accTitle` statement that sets its title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

`title` sets the title drawn above the diagram, and `accTitle` sets its
accessible title. When either is set again, mermaid.js uses the later value
without an error, and the earlier one is lost.

## Rule Details

This rule applies to quadrant charts (`quadrantChart`). It reports a `title` or
`accTitle` statement that replaces the current value of the same title with a
different one. The two titles are checked separately, and a statement that
repeats the current value is not reported.

An `accTitle:` with no text on its line also sets the accessible title and is
counted: it takes the next line that holds text, past empty lines, comment
lines, and directives, even when that line is a statement. After `accTitle: a`,
the lines `accTitle:` and `title U` set the accessible title `title U`, which is
reported. Replacing the frontmatter title with a `title` statement is not
reported.

The keywords are read in any case. A `title` with no text sets an empty title
and is reported if it replaces a different title. Titles are compared without
the whitespace at their ends, but quotes and `;` in a `title` are part of its
text: `title "Sales"` differs from `title Sales`, and `title a; title b` is one
title.

After `accTitle: a` and `accTitle: b`, a third `accTitle: a` is reported because
it replaces `b`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-title: error
quadrantChart
  title first
  title second
  A: [0.3, 0.6]
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-title: error
quadrantChart
  accTitle: first
  accTitle: second
  A: [0.3, 0.6]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-title: error
quadrantChart
  title first
  accTitle: second
  A: [0.3, 0.6]
```

## Options

This rule has no options.

## Related Rules

- [quadrant-no-duplicate-description](./quadrant-no-duplicate-description.md)
- [xychart-no-duplicate-title](./xychart-no-duplicate-title.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/quadrant-no-duplicate-title.ts)
- [Tests source](../../tests/rules/quadrant-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
