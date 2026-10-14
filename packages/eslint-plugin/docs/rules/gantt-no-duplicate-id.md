# @mmd-toolkit/gantt-no-duplicate-id

Japanese version: [gantt-no-duplicate-id.ja.md](./gantt-no-duplicate-id.ja.md)

Disallow a task id that an earlier task already has.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A task id names one task, for `after`, `until`, and `click`. When two tasks have
the same id, mermaid.js gives no error, and the id names the later task: a task
that was meant to follow the first one follows the second. A reused id is
usually left over from copying the line of a task.

## Rule Details

This rule reports the id of a task when an earlier task has the same id. It
applies to `gantt`.

After `Design :des1, 2024-01-06, 3d` and `Build :des1, 2024-01-09, 5d`,
`Test :after des1, 2d` starts after `Build`, and `click des1 href "…"` makes
only `Build` a link. A task whose data has one item starts at the end of the
task before it, which mermaid.js also finds by its id: after
`a : x, 2024-01-01, 1d`, the task `b : 1d` starts at the end of
`c : x, 2024-03-01, 1d`, written after it, not at the end of `a`.

The ids compared are those written as the first of three items after the tags.
The ids that mermaid.js gives to the tasks without one, `task1`, `task2`, and so
on, are not: `b : task1, 2024-01-01, 1d` after `a : 1d` is not reported. Ids are
compared in their case: `x` and `X` are two ids.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-id: error
gantt
  dateFormat YYYY-MM-DD
  Design :des1, 2024-01-06, 3d
  Build :des1, 2024-01-09, 5d
  Test :after des1, 2d
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-id: error
gantt
  dateFormat YYYY-MM-DD
  Design :des1, 2024-01-06, 3d
  Build :des2, 2024-01-09, 5d
  Test :after des1, 2d
```

## Options

This rule has no options.

## Related Rules

- [gantt-no-undef](./gantt-no-undef.md)

## Background

mermaid.js keeps one task for each id, and each task replaces the one stored
before it under the same id
([`addTask`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L588-L590)).
A task whose data has one item keeps the id of the task before it and looks that
id up when the chart is drawn
([`compileTasks`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L624-L625)).

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gantt-no-duplicate-id.ts)
- [Tests source](../../tests/rules/gantt-no-duplicate-id.test.ts)

<!-- end auto-generated rule resources -->
