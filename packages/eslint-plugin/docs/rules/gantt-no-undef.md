# @mmd-toolkit/gantt-no-undef

Japanese version: [gantt-no-undef.ja.md](./gantt-no-undef.ja.md)

Disallow a task id in `click`, `after`, or `until` that is the id of no task.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`click` names the tasks that it makes links, `after` names the tasks after which
a task starts, and `until` the tasks at whose start a task ends. When an id is
that of no task, mermaid.js gives no error: `click` makes no task a link, and
`after` and `until` put the start or the end of the task at today's date. A
misspelled id moves the task to today.

## Rule Details

This rule reports an id in a `click` statement, after `after`, or after `until`
that is the id of no task of the chart. It applies to `gantt`.

After `Design :des1, 2024-01-06, 3d`, `click des2 href "…"` makes no task a
link, `Build :after des2, 5d` starts on today's date, and
`Review :2024-01-01, until des2` ends on today's date. Each id of a list is
checked: `click des1,des3 href "…"` makes `des1` a link, and `des3` is reported.
`after des1 des2` starts the task after `des1`, as if `des2` were not written,
and `des2` is reported.

The ids of the chart are those of its tasks. After its tags, the data of a task
holds one to three items: with three, the first is the id, as `des1` in
`Design :des1, 2024-01-06, 3d`; with one or two, mermaid.js gives the task the
id `task1`, `task2`, and so on, in the order of the text. A task whose data has
four items or more has no id. `click task1 href "…"` after `a : 2024-01-01, 1d`
makes that task a link and is not reported.

`after` is read in the start of the data, the first of two items or the second
of three, and `until` in the end, the last of one to three items, both in lower
case and followed by whitespace. mermaid.js reads the ids up to the first
character that is not an ASCII letter, a digit, `_`, `-`, or a space, and splits
them at the spaces. So `after a.1` names the task `a`, and the rule reports `a`
when no task has that id, also when a task has the id `a.1`, and so for
`after a設計`; with a tab between two ids, mermaid.js reads only the first. When
no such character follows the whitespace, as in `after 設計`, mermaid.js reads
the item as a date, which it cannot read, and does not draw the chart; the rule
does not report it. Other items are no references, and the rule does not read
them: `After a2` and `Until b1` are read as dates, and in a data of four items
or more, mermaid.js reads no item and cannot draw the chart. A directive inside
an id is not part of it: `after a%%{init: {}}%%1` names the task `a1`. Ids are
compared as written, in their case: after `a : Des1, 2024-01-01, 1d`,
`after des1` names no task and is reported.

A task written after the one that names it is a task of the chart: `after t1`
before the task `t1` starts the task after `t1`. A `click` statement written
before the task that it names does not make it a link in mermaid.js. Such a
statement names an id of the chart, which is written correctly, and the rule
does not report it.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-undef: error
gantt
  dateFormat YYYY-MM-DD
  Design :des1, 2024-01-06, 3d
  click des2 href "https://example.com"
```

```mmd
%% eslint @mmd-toolkit/gantt-no-undef: error
gantt
  dateFormat YYYY-MM-DD
  Design :des1, 2024-01-06, 3d
  Build :after des2, 5d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-undef: error
gantt
  dateFormat YYYY-MM-DD
  Design :des1, 2024-01-06, 3d
  Review :2024-01-01, until des2
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-undef: error
gantt
  dateFormat YYYY-MM-DD
  Design :des1, 2024-01-06, 3d
  Build :after des1, 5d
  click des1 href "https://example.com"
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-undef](./flowchart-no-undef.md)
- [gantt-no-duplicate-id](./gantt-no-duplicate-id.md)

## Background

mermaid.js reads `after` and `until` when it draws the chart, with the
expressions `/^after\s+(?<ids>[\d\w- ]+)/` and `/^until\s+(?<ids>[\d\w- ]+)/`,
and puts the start or the end at today's date when none of the ids is the id of
a task
([`getStartDate`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L304-L323)
and
[`getEndDate`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L388-L407)).
`click` looks the ids up while the text is read, so a task written after it is
not found yet
([`setLink`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L673-L688)).
When `after` names several tasks and one of them is written later, mermaid.js
can start the task without waiting for that one:
[#4424](https://github.com/mermaid-js/mermaid/issues/4424) ("gantt: Depedencies
('after') not always taken into account") is open with the labels "Type: Bug /
Error" and "Status: Triage".

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gantt-no-undef.ts)
- [Tests source](../../tests/rules/gantt-no-undef.test.ts)

<!-- end auto-generated rule resources -->
