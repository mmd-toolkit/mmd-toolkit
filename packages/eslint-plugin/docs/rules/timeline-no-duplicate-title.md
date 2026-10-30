# @mmd-toolkit/timeline-no-duplicate-title

Japanese version:
[timeline-no-duplicate-title.ja.md](./timeline-no-duplicate-title.ja.md)

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

This rule applies to timelines (`timeline`). It reports a `title` or `accTitle`
statement that replaces the current value of the same title with a different
one. The two titles are checked separately, and a statement that repeats the
current value is not reported.

An `accTitle:` with no text on its line also sets the accessible title and is
counted: it takes the next line that holds text, past empty lines, comment
lines, and directives. The frontmatter title is a separate value and is not
counted.

mermaid.js reads `title`, in any case, as a title statement when one whitespace
character and at least one more character on the line follow it. That whitespace
can be a line break, so `title` can take the next line, including its
indentation, as the title. Comment lines are skipped and directives are left
out; a line of whitespace, with or without directives, supplies that whitespace
as the title.

A line meant as a period that starts with `title`, such as `Title page : x`, is
also counted as a title. Without an earlier title, it is not reported. `title`
is instead a period and is not counted at the end of the text, with just one
space or tab before the end of its line, or before a line that is empty after
directives are left out. With two or more whitespace characters after `title`,
the whitespace after the first one is a title and is counted.

Accessible titles are compared without the whitespace at their ends. The text of
`title` is compared as written, including whitespace, so `title  T` after
`title T` is reported even if they look the same when drawn.

After `accTitle: a` and `accTitle: b`, a third `accTitle: a` is reported because
it replaces `b`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/timeline-no-duplicate-title: error
timeline
  title first
  title second
  2020 : Launch
```

```mmd
%% eslint @mmd-toolkit/timeline-no-duplicate-title: error
timeline
  accTitle: first
  accTitle: second
  2020 : Launch
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/timeline-no-duplicate-title: error
timeline
  title first
  accTitle: second
  2020 : Launch
```

```mmd
%% eslint @mmd-toolkit/timeline-no-duplicate-title: error
timeline
  title first
  title first
  2020 : Launch
```

## Options

This rule has no options.

## Related Rules

- [journey-no-duplicate-title](./journey-no-duplicate-title.md)
- [timeline-no-duplicate-description](./timeline-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/timeline-no-duplicate-title.ts)
- [Tests source](../../tests/rules/timeline-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
