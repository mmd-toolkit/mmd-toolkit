# @mmd-toolkit/gitgraph-no-duplicate-title

Japanese version:
[gitgraph-no-duplicate-title.ja.md](./gitgraph-no-duplicate-title.ja.md)

Disallow a `title` or an `accTitle` that replaces the title set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A git graph has one title, which `title` sets, and one accessible title, which
`accTitle` sets. A later statement replaces the title set before it without an
error, and the earlier title is lost.

## Rule Details

This rule reports a `title` statement that changes the title that an earlier
`title` set, and an `accTitle` statement that changes the accessible title that
an earlier `accTitle` set, when that title is not empty. It applies to
`gitgraph`.

After `title first` and `title second`, the title is `second`, and so for
`accTitle`. The two titles are separate values: `title first` and
`accTitle: second` set both, and neither is reported. `title` with no text, and
`accTitle:` with no text, or either with only whitespace, leaves the title
empty: after `title first`, it is reported, because `first` is lost. It does not
take the next line as its title. A statement after an empty title loses nothing
and is not reported.

A `title` statement also replaces the title of the frontmatter without an error:
with `title: Front` in the frontmatter, `title T` gives the title `T`. The rule
does not report this, since it does not read the frontmatter. For the same
reason, after `title first`, `title` with no text is reported also where the
frontmatter gives a title, which the diagram then shows in place of `first`, and
also where that title is `first`.

A statement that sets the title that the diagram already has is not reported.
Titles are compared as mermaid.js keeps them, without the whitespace at their
ends and with a run of two or more spaces or tabs as one space, so
`title  first  report` sets the same title as `title first report`. After
`title a` and `title b`, a third `title a` is reported, because it replaces `b`.
Titles are otherwise compared as written: mermaid.js turns character references,
as `#35;`, and the quotes of HTML attributes into other characters before it
reads a title, so two titles that differ only in those may be one title for
mermaid.js and two for this rule.

Keep one `title` statement and one `accTitle` statement.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-duplicate-title: error
gitGraph
  title First
  title Second
  commit
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-duplicate-title: error
gitGraph
  title Second
  commit
```

## Options

This rule has no options.

## Related Rules

- [gitgraph-no-duplicate-description](./gitgraph-no-duplicate-description.md)

## Background

The
[value converter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L57-L60)
removes the whitespace at the ends of a title and makes a run of two or more
spaces or tabs one space. The parser keeps the last title of each kind, and
[`populateCommonDb`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L14)
sets it only when it is not empty.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gitgraph-no-duplicate-title.ts)
- [Tests source](../../tests/rules/gitgraph-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
