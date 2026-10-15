# @mmd-toolkit/journey-no-duplicate-title

Japanese version:
[journey-no-duplicate-title.ja.md](./journey-no-duplicate-title.ja.md)

Disallow a `title` or `accTitle` statement that sets its title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A user journey has two titles: the title that `title` sets, drawn above the
journey, and the accessible title that `accTitle` sets. mermaid.js accepts every
statement that sets one of them, and each one silently replaces the value set
before it. A second title is usually left over from rewriting the text or from
pasting a part twice.

## Rule Details

This rule reports every `title` statement after the first one, and every
`accTitle` statement after the first one, when the statement sets a value other
than the one before it. It applies to `journey`.

After `title first` and `title second`, the title is `second`, and so for
`accTitle`. `accTitle:` with no text on its line takes the next line that holds
text as the accessible title, past empty lines, comment lines, and directives:
after `accTitle: a`, the lines `accTitle:` and `T` give the accessible title
`T`, and the second statement is reported. The two titles are separate values:
`title first` and `accTitle: second` set both, and neither is reported.

The word `title` starts a title statement in any case, also at the start of a
line meant as a task: after `title My day`, the line `Title page: 5: Me` gives
the title `page: 5: Me` and no task, and the rule reports it as a second title.
Without an earlier title, the line is the only title, and it is not reported.

A `title` statement also replaces the title of the frontmatter without an error:
with `title: Frontmatter title` in the frontmatter, `title Statement title`
gives the title `Statement title`. The rule does not report this.

A statement that sets the title that the diagram already has is not reported:
after `accTitle: a`, a second `accTitle: a` loses nothing. Titles are compared
as mermaid.js keeps them, without the whitespace at their ends, so
`accTitle:  a` sets the same title. After `accTitle: a` and `accTitle: b`, a
third `accTitle: a` is reported, because it replaces `b`. The same holds for
`title`, whose text keeps its whitespace: after `title T`, the statement
`title  T`, with two spaces, sets another title, and it is reported, also where
the two titles look the same when drawn.

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
