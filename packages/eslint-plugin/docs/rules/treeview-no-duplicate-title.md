# @mmd-toolkit/treeview-no-duplicate-title

Japanese version:
[treeview-no-duplicate-title.ja.md](./treeview-no-duplicate-title.ja.md)

Disallow an `accTitle` that replaces the accessible title set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A tree view has one accessible title, which `accTitle` sets. A later `accTitle`
replaces the title set before it without an error, and the earlier title is
lost.

## Rule Details

This rule reports an `accTitle` statement that changes the accessible title that
an earlier `accTitle` set, when that title is not empty. It applies to
`treeView`.

After `accTitle: First` and `accTitle: Second`, the accessible title is
`Second`. `accTitle:` with no text, or with only whitespace, leaves the title
empty: after `accTitle: First`, it is reported, because `First` is lost. It does
not take the next line as its title. A statement after an empty title loses
nothing and is not reported. `title` is not compared, since mermaid.js does not
draw the title of a tree view.

A statement that sets the title that the diagram already has is not reported.
Titles are compared as mermaid.js keeps them, without the whitespace at their
ends and with a run of two or more spaces or tabs as one space, so
`accTitle: First  report` sets the same title as `accTitle: First report`. After
`accTitle: a` and `accTitle: b`, a third `accTitle: a` is reported, because it
replaces `b`. Titles are otherwise compared as written: mermaid.js turns
character references, as `#35;`, and the quotes of HTML attributes into other
characters before it reads a title, and reads a tab on a line that starts with
box-drawing characters as four spaces, so two titles that differ only in those
may be one title for mermaid.js and two for this rule.

Keep one `accTitle` statement.

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

## Background

The
[value converter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/common/valueConverter.ts#L57-L60)
removes the whitespace at the ends of a title and makes a run of two or more
spaces or tabs one space. The parser keeps the last title, and
[`populateCommonDb`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/populateCommonDb.ts#L4-L14)
sets it only when it is not empty.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/treeview-no-duplicate-title.ts)
- [Tests source](../../tests/rules/treeview-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
