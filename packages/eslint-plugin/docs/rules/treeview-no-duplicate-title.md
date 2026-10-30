# @mmd-toolkit/treeview-no-duplicate-title

Japanese version:
[treeview-no-duplicate-title.ja.md](./treeview-no-duplicate-title.ja.md)

Disallow an `accTitle` that replaces the accessible title set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A tree view has one accessible title, which `accTitle` sets. A later `accTitle`
replaces the title set before it without an error, and the earlier title is
lost.

## Rule Details

This rule applies to tree views (`treeView-beta`). It reports an `accTitle` that
changes a nonempty accessible title set by the preceding `accTitle`. An empty or
whitespace-only `accTitle:` clears the title without taking the next line, and
is reported after a nonempty title. A statement after an empty title, or one
that repeats the current title, is not reported. Going back to an earlier title
is reported: after `accTitle: a` and `accTitle: b`, a third `accTitle: a` is
reported.

A repeated `title` statement is not reported, because mermaid.js does not draw
the title of a tree view.

Titles are compared without whitespace at their ends and with a run of two or
more spaces or tabs as one space. They are otherwise compared as written.
mermaid.js converts character references such as `#35;` and HTML attribute
quotes before reading a title. Titles differing only in these ways may be the
same for mermaid.js and different for this rule.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/treeview-no-duplicate-title: error
treeView-beta
  accTitle: First
  accTitle: Second
  root/
    file
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/treeview-no-duplicate-title: error
treeView-beta
  accTitle: Second
  root/
    file
```

## Options

This rule has no options.

## Related Rules

- [treeview-no-duplicate-description](./treeview-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/treeview-no-duplicate-title.ts)
- [Tests source](../../tests/rules/treeview-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
