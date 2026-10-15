# @mmd-toolkit/gantt-no-unread-tag

Japanese version: [gantt-no-unread-tag.ja.md](./gantt-no-unread-tag.ja.md)

Disallow a tag in the data of a task that mermaid.js does not read as a tag.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A tag in the place of the start or the end of a task is not read as a tag:
mermaid.js reads the word as a date, which it is not, and the task loses its
start or its end. This happens to a tag written in another case, as `DONE`, to
tags written without the comma between them, as `done crit`, and to a tag
written after another item, as in `a : 2024-01-01, done`. The tags `active`,
`done`, `crit`, `milestone`, and `vert` mark a task only at the front of its
data, each in lower case and followed by a comma.

## Rule Details

This rule reports an item of the data of a task that is the start or the end of
the task and whose first word is a tag in any case. It applies to `gantt`.

After its tags, the data of a task holds one to three items: the end; the start
and the end; or the id, the start, and the end. In `b : DONE, 1d`, the start is
`DONE`, and so in `b : done crit, 1d` it is `done crit`; mermaid.js cannot read
the start, and it does not draw the chart. In `a : 2024-01-01, done`, the end is
`done`, and the task ends where it starts, with no length; so it is with
`b : Done`, whose one item is the end.

The id is not checked: `Design :Done, 2024-01-06, 3d` is a task with the id
`Done`, and `Design :done crit, 2024-01-06, 3d` one with the id `done crit`.
Both have the start and the end that are written, and mermaid.js reads the first
item as an id, which may be any word; the rule does not report it.

Data of four items or more is not checked: mermaid.js reads none of its items
and cannot draw the chart, as for `A :a1, crit, 2024-01-01, 1d`.

Tags at the front, with their commas, are read as tags and are not reported,
also with whitespace around them, as in `a :  done , crit ,1d`. A word that only
starts with the letters of a tag is no tag: the end `criteria` is not reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
  Build :DONE, 5d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
  Build :done crit, 5d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :2024-01-06, done
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :done, 2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :done, crit, des1, 2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :Done, 2024-01-06, 3d
```

## Options

This rule has no options.

## Background

mermaid.js takes the tags from the front of the data while the first item,
without the whitespace at its ends, is one of the words in lower case
([`getTaskTags`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L846-L860)).
Its documentation
([syntax/gantt.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gantt.md#L69))
lists the tags `active`, `done`, `crit`, and `milestone` in lower case, and says
that they come first.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gantt-no-unread-tag.ts)
- [Tests source](../../tests/rules/gantt-no-unread-tag.test.ts)

<!-- end auto-generated rule resources -->
