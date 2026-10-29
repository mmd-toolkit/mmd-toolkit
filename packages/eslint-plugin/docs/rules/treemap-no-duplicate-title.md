# @mmd-toolkit/treemap-no-duplicate-title

Japanese version:
[treemap-no-duplicate-title.ja.md](./treemap-no-duplicate-title.ja.md)

Disallow a `title` or an `accTitle` that replaces the title set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A treemap has one title, which `title` sets, and one accessible title, which
`accTitle` sets. A later statement replaces the title set before it without an
error, and the earlier title is lost.

## Rule Details

This rule applies to treemaps (`treemap` and `treemap-beta`). It reports a
`title` that changes a nonempty title set by the preceding `title`, and an
`accTitle` that changes a nonempty accessible title set by the preceding
`accTitle`. The two titles are separate, so setting one does not replace the
other. An empty or whitespace-only `title` or `accTitle:` clears its title
without taking the next line, and is reported after a nonempty title.

A statement after an empty title, or one that repeats the current title, is not
reported. Going back to an earlier title is reported: after `title a` and
`title b`, a third `title a` is reported.

The rule does not read frontmatter, so it does not report a statement that
replaces a frontmatter title. After `title first`, an empty `title` is reported
even when the diagram then shows a frontmatter title, including one that is also
`first`.

Titles are compared without whitespace at their ends and with a run of two or
more spaces or tabs as one space. They are otherwise compared as written.
mermaid.js converts character references such as `#35;` and HTML attribute
quotes before reading a title. Titles differing only in these ways may be the
same for mermaid.js and different for this rule.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/treemap-no-duplicate-title: error
treemap
  title First
  title Second
  "Revenue": 10
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/treemap-no-duplicate-title: error
treemap
  title Second
  "Revenue": 10
```

## Options

This rule has no options.

## Related Rules

- [treemap-no-duplicate-description](./treemap-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/treemap-no-duplicate-title.ts)
- [Tests source](../../tests/rules/treemap-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
