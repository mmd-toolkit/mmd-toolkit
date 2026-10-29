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

This rule applies to Gantt charts (`gantt`). It reports each id in `click`,
`after`, or `until` that no task in the chart has.

Explicit task ids and the ids that mermaid.js assigns, such as `task1`, count as
defined, and comparisons are case-sensitive. With three items after the tags,
the first is the task id; with one or two, mermaid.js assigns `task1`, `task2`,
and so on in text order. A task with four or more data items has no id.

`after` is checked in the start item, the first of two items or the second of
three; `until` is checked in the end item, the last of one to three. Both must
be lower case and followed by whitespace. Their ids consist of ASCII letters,
digits, `_`, `-`, and spaces, and are split at spaces: `after a.1` names `a` and
is reported even when a task has the id `a.1`, and so does `after a設計`; a tab
between ids ends the list.

`after` or `until` followed by no such character, as in `after 設計`, is not
reported: mermaid.js reads the item as a date, cannot read it, and does not draw
the chart. `After a2`, `Until b1`, and data with four or more items are not
checked either. Tasks defined later count as defined, including for `click`,
although a `click` before its task does nothing in mermaid.js.

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

## Further Reading

- [Issue #4424: gantt `after` not always taken into account](https://github.com/mermaid-js/mermaid/issues/4424)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gantt-no-undef.ts)
- [Tests source](../../tests/rules/gantt-no-undef.test.ts)

<!-- end auto-generated rule resources -->
