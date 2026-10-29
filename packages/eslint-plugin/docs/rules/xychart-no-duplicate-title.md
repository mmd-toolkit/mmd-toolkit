# @mmd-toolkit/xychart-no-duplicate-title

Japanese version:
[xychart-no-duplicate-title.ja.md](./xychart-no-duplicate-title.ja.md)

Disallow a `title` or `accTitle` statement that sets its title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`title` sets the title drawn above the diagram, and `accTitle` sets its
accessible title. When either is set again, mermaid.js uses the later value
without an error, and the earlier one is lost.

## Rule Details

This rule applies to XY charts (`xychart` and `xychart-beta`). It reports a
`title` or `accTitle` statement that replaces the current value of the same
title with a different one. The two titles are checked separately, and a
statement that repeats the current value is not reported.

`accTitle:` with no text on its line takes the next line that holds text, past
empty lines, comment lines, and directives. With no such line before the end of
the text, `accTitle:` sets the empty accessible title and is reported if it
replaces a different value. The frontmatter title is a separate value and is not
counted.

The keywords are read in any case, and two title statements on one line count as
two. Unquoted words in a `title` are joined without spaces, so `title Two words`
and `title Twowords` set the same title. Quoted titles and accessible titles are
compared without the whitespace at their ends; `title Sales` and `title "Sales"`
set the same title.

After `accTitle: a` and `accTitle: b`, a third `accTitle: a` is reported because
it replaces `b`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-title: error
xychart
  title first
  title second
  line [1, 2]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-title: error
xychart
  accTitle: first
  accTitle: second
  line [1, 2]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-title: error
xychart
  title first
  accTitle: second
  line [1, 2]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-title: error
xychart
  title Sales
  title "Sales"
  line [1, 2]
```

## Options

This rule has no options.

## Related Rules

- [timeline-no-duplicate-title](./timeline-no-duplicate-title.md)
- [xychart-no-duplicate-description](./xychart-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/xychart-no-duplicate-title.ts)
- [Tests source](../../tests/rules/xychart-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
