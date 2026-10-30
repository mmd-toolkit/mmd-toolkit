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

This rule applies to Gantt charts (`gantt`). It reports a task id that an
earlier task already has. Only ids written as the first of three items after the
tags are compared. Ids are case-sensitive, so `x` and `X` differ.

Ids that mermaid.js assigns to tasks without an explicit id, such as `task1` and
`task2`, are not compared. For example, `b : task1, 2024-01-01, 1d` after
`a : 1d` is not reported.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gantt-no-duplicate-id.ts)
- [Tests source](../../tests/rules/gantt-no-duplicate-id.test.ts)

<!-- end auto-generated rule resources -->
