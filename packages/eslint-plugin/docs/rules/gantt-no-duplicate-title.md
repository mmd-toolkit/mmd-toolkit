# @mmd-toolkit/gantt-no-duplicate-title

Japanese version:
[gantt-no-duplicate-title.ja.md](./gantt-no-duplicate-title.ja.md)

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

This rule applies to Gantt charts (`gantt`). It reports a `title` or `accTitle`
statement that replaces the current value of the same title with a different
one. The two titles are checked separately, and a statement that repeats the
current value is not reported.

An `accTitle:` with no text on its line also sets the accessible title and is
counted: it takes the next line that holds text, past empty lines, comment
lines, and directives. Replacing the frontmatter title with a `title` statement
is not reported.

`accTitle` values are compared without whitespace at their ends, while `title`
values keep their whitespace: `title  T` after `title T` is reported even if the
drawing looks the same. After `accTitle: a` and `accTitle: b`, a third
`accTitle: a` is reported because it replaces `b`.

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

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-title: error
gantt
  title first
  title first
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
