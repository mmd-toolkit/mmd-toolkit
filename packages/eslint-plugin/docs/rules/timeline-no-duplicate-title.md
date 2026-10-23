# @mmd-toolkit/timeline-no-duplicate-title

Japanese version:
[timeline-no-duplicate-title.ja.md](./timeline-no-duplicate-title.ja.md)

Disallow a `title` or `accTitle` statement that sets its title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A timeline has two titles: the title that `title` sets, drawn above the
timeline, and the accessible title that `accTitle` sets. mermaid.js accepts
every statement that sets one of them, and each one silently replaces the value
set before it. A second title is usually left over from rewriting the text or
from pasting a part twice.

## Rule Details

This rule reports every `title` statement after the first one, and every
`accTitle` statement after the first one, when the statement sets a value other
than the one before it. It applies to `timeline`.

After `title first` and `title second`, the title is `second`, and so for
`accTitle`. `accTitle:` with no text on its line takes the next line that holds
text as the accessible title, past empty lines, comment lines, and directives:
after `accTitle: a`, the lines `accTitle:` and `b` give the accessible title
`b`, and the second statement is reported. The two titles are separate values:
`title first` and `accTitle: second` set both, and neither is reported. The
title of the frontmatter is another value, and it is not counted.

The word `title` starts a title statement in any case, followed by one
whitespace character, which may be a line feed, and the rest of the line, which
may be whitespace only. So `title` at the end of its line takes the whole next
line as its title: after `title My life`, the lines `title` and `2020 : a` give
the title `  2020 : a`, with the indentation of that line, and no period `2020`,
and the rule reports the second title. So does a line meant as a period that
starts with the word: after `title My life`, the line `Title page : x` gives the
title `page : x` and no period. A comment line between `title` and the next line
is removed, and the line after it is taken. A directive on the next line is no
part of it: a line of whitespace only, or of whitespace and a directive, gives a
title of that whitespace, and a line `%%{init: {}}%%x` the title `x`. Without an
earlier title, such a line is the only title, and it is not reported.

`title` is a period, and it is not counted, where no character can follow the
one whitespace character: with that character and then the end of its line,
which gives the period of `title` and that character, as `title` and a space or
a tab; at the end of the text; and with a line feed and then a line that is
empty once its directives are left out, an empty line or a line of directives
only that starts at its first column, which give the period `title`. With two
whitespace characters or more after it, `title` is a title of the whitespace
after the first one, as `title` and two spaces, which gives the title of one
space, and it is counted.

A statement that sets the title that the diagram already has is not reported:
after `accTitle: a`, a second `accTitle: a` loses nothing. Titles are compared
as mermaid.js keeps them: an accessible title without the whitespace at its
ends, so `accTitle:  a` sets the same title, and the text of `title` as written,
whitespace included, so after `title T`, the statement `title  T`, with two
spaces, sets another title, and it is reported, also where the two titles look
the same when drawn. After `accTitle: a` and `accTitle: b`, a third
`accTitle: a` is reported, because it replaces `b`.

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
