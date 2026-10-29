# @mmd-toolkit/journey-no-duplicate-title

Japanese version:
[journey-no-duplicate-title.ja.md](./journey-no-duplicate-title.ja.md)

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

This rule applies to user journey diagrams (`journey`). It reports a `title` or
`accTitle` statement that replaces the current value of the same title with a
different one. The two titles are checked separately, and a statement that
repeats the current value is not reported.

An `accTitle:` with no text on its line also sets the accessible title and is
counted: it takes the next line that holds text, past empty lines, comment
lines, and directives. Replacing the frontmatter title with a `title` statement
is not reported.

`accTitle` values are compared without whitespace at their ends, while `title`
values keep their whitespace: `title  T` after `title T` is reported even if the
drawing looks the same.

mermaid.js reads `title` in any case as a title statement, also at the start of
a line meant as a task: after `title My day`, `Title page: 5: Me` sets the title
`page: 5: Me` instead of a task and is reported. Without an earlier title, it is
not reported.

After `accTitle: a` and `accTitle: b`, a third `accTitle: a` is reported because
it replaces `b`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/journey-no-duplicate-title: error
journey
  title first
  title second
  section Work
    Make tea: 5: Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-duplicate-title: error
journey
  accTitle: first
  accTitle: second
  section Work
    Make tea: 5: Me
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/journey-no-duplicate-title: error
journey
  title first
  accTitle: second
  section Work
    Make tea: 5: Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-duplicate-title: error
journey
  title first
  title first
  section Work
    Make tea: 5: Me
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.md)
- [gantt-no-duplicate-title](./gantt-no-duplicate-title.md)
- [journey-no-duplicate-description](./journey-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/journey-no-duplicate-title.ts)
- [Tests source](../../tests/rules/journey-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
