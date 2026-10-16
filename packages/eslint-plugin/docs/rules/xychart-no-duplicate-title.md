# @mmd-toolkit/xychart-no-duplicate-title

Japanese version:
[xychart-no-duplicate-title.ja.md](./xychart-no-duplicate-title.ja.md)

Disallow a `title` or `accTitle` statement that sets its title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

An XY chart has two titles: the title that `title` sets, drawn above the chart,
and the accessible title that `accTitle` sets. mermaid.js accepts every
statement that sets one of them, and each one silently replaces the value set
before it. A second title is usually left over from rewriting the text or from
pasting a part twice.

## Rule Details

This rule reports every `title` statement after the first one, and every
`accTitle` statement after the first one, when the statement sets a value other
than the one before it. It applies to `xychart`.

After `title first` and `title second`, the title is `second`, and so for
`accTitle`; the keywords are read in any case, and two title statements on one
line count as two. `accTitle:` with no text on its line takes the next line that
holds text as the accessible title, past empty lines, comment lines, and
directives, and with no such line before the end of the text it sets the empty
accessible title: after `accTitle: a`, both are reported. The two titles are
separate values: `title first` and `accTitle: second` set both, and neither is
reported. The title of the frontmatter is another value, and it is not counted.

A statement that sets the title that the chart already has is not reported:
after `title Sales`, a second `title "Sales"` loses nothing. Titles are compared
as mermaid.js keeps them: words without quotes are joined without the spaces
between them, so `title Two words` sets the title `Twowords`, the same as
`title Twowords`; a text in quotes and an accessible title are read without the
whitespace at their ends. After `title a` and `title b`, a third `title a` is
reported, because it replaces `b`.

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
