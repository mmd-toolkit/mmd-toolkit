# @mmd-toolkit/gantt-no-unread-tag

Japanese version: [gantt-no-unread-tag.ja.md](./gantt-no-unread-tag.ja.md)

Disallow a tag in the data of a task that mermaid.js does not read as a tag.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

The tags `active`, `done`, `crit`, `milestone`, and `vert` mark a task. They
stand at the front of its data, each in lower case and followed by a comma.
Written in another case, without its comma, or after another item, a tag is read
as an item: mermaid.js gives no error, the task is not marked, and the item
takes the place of the id, the start, or the end.

## Rule Details

This rule reports an item of the data of a task whose first word is a tag in any
case, where mermaid.js does not read the item as a tag. It applies to `gantt`.

`Design :Done, 2024-01-06, 3d` is a task with the id `Done`, drawn as a task
that is not done. `Design :done crit, 2024-01-06, 3d` has the id `done crit` and
no tag, and `Design :done des1, 2024-01-06, 3d` the id `done des1` and no tag.
With two items, the word takes the place of the start: in `a : DONE, 1d`, the
start is `DONE`, which is no date. After another item, a tag is an item too: in
`a : 1d, done`, `done` is the end.

Data of four items or more is not checked: mermaid.js reads none of its items
and cannot draw the chart, as for `A :a1, crit, 2024-01-01, 1d`.

Tags at the front, with their commas, are read as tags and are not reported,
also with whitespace around them, as in `a :  done , crit ,1d`. A word that only
starts with the letters of a tag is no tag: the id `critical` is not reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :Done, 2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :done crit, 2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-unread-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :done des1, 2024-01-06, 3d
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
