# @mmd-toolkit/quadrant-no-duplicate-title

Japanese version:
[quadrant-no-duplicate-title.ja.md](./quadrant-no-duplicate-title.ja.md)

Disallow a `title` or `accTitle` statement that sets its title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A quadrant chart has two titles: the title that `title` sets, drawn above the
chart, and the accessible title that `accTitle` sets. mermaid.js accepts every
statement that sets one of them, and each one silently replaces the value set
before it. A second title is usually left over from rewriting the text or from
pasting a part twice.

## Rule Details

This rule reports every `title` statement after the first one, and every
`accTitle` statement after the first one, when the statement sets a value other
than the one before it. It applies to `quadrantChart`.

After `title first` and `title second`, the title is `second`, and so for
`accTitle`; the keywords are read in any case. `title` with no text sets the
empty title: after `title T`, it is reported. `accTitle:` with no text on its
line takes the next line that holds text as the accessible title, past empty
lines, comment lines, and directives, also when that line is a statement: after
`accTitle: a`, the lines `accTitle:` and `title U` give the accessible title
`title U`, and the second `accTitle` is reported. The two titles are separate
values: `title first` and `accTitle: second` set both, and neither is reported.

A `title` statement also replaces the title of the frontmatter without an error:
with `title: Front` in the frontmatter, `title T` gives the title `T`. The rule
does not report this.

A statement that sets the title that the chart already has is not reported:
after `title Sales`, a second `title   Sales`, with more spaces, loses nothing.
Titles are compared as mermaid.js keeps them, without the whitespace at their
ends. A title takes the whole rest of its line as text, its quotes and a `;`
included: after `title Sales`, the statement `title "Sales"` sets the title
`"Sales"`, with its quotes, and it is reported, while `title a; title b` is one
title, `a; title b`. After `title a` and `title b`, a third `title a` is
reported, because it replaces `b`.

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
