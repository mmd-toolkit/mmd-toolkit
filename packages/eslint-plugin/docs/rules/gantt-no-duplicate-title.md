# @mmd-toolkit/gantt-no-duplicate-title

Japanese version:
[gantt-no-duplicate-title.ja.md](./gantt-no-duplicate-title.ja.md)

Disallow a `title` or `accTitle` statement that sets its title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A Gantt chart has two titles: the title that `title` sets, drawn above the
chart, and the accessible title that `accTitle` sets. mermaid.js accepts every
statement that sets one of them, and each one silently replaces the value set
before it. A second title is usually left over from rewriting the text or from
pasting a part twice.

## Rule Details

This rule reports every `title` statement after the first one, and every
`accTitle` statement after the first one. It applies to `gantt`.

After `title first` and `title second`, the title is `second`, and so for
`accTitle`. `accTitle:` with no text on its line takes the next line that holds
text as the accessible title, past empty lines, comment lines, and directives:
after `accTitle: a`, the lines `accTitle:` and `T` give the accessible title
`T`, and the second statement is reported. The two titles are separate values:
`title first` and `accTitle: second` set both, and neither is reported.

A `title` statement also replaces the title of the frontmatter without an error:
with `title: Frontmatter title` in the frontmatter, `title Statement title`
gives the title `Statement title`. The rule does not report this.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-title: error
gantt
  title first
  title second
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-title: error
gantt
  accTitle: first
  accTitle: second
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-title: error
gantt
  title first
  accTitle: second
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.md)
- [sequence-no-duplicate-title](./sequence-no-duplicate-title.md)
- [gantt-no-duplicate-description](./gantt-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gantt-no-duplicate-title.ts)
- [Tests source](../../tests/rules/gantt-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
