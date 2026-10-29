# @mmd-toolkit/gantt-no-invalid-tag

Japanese version: [gantt-no-invalid-tag.ja.md](./gantt-no-invalid-tag.ja.md)

Disallow a tag in the data of a task that mermaid.js does not read as a tag.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

The tags `active`, `done`, `crit`, `milestone`, and `vert` mark a task only at
the front of its data, in lower case and followed by commas. A tag word written
as the start or the end of a task, in another case (`DONE`), without the comma
between tags (`done crit`), or after another item (`a : 2024-01-01, done`), is
read as a date, and the task loses its start or end.

## Rule Details

This rule applies to Gantt charts (`gantt`). It reports a start or end item of
task data whose first word is `active`, `done`, `crit`, `milestone`, or `vert`,
in any case. Tags at the front of the data, each in lower case and followed by a
comma, are not reported, also with whitespace around them.

After the tags, one item is the end, two are the start and end, and three are
the id, start, and end. The id is not checked, so `Done` and `done crit` as the
first of three items are not reported. Data with four or more items is not
checked because mermaid.js cannot draw the chart from it. A word that merely
starts with a tag, such as `criteria`, is not reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-invalid-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
  Build :DONE, 5d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-invalid-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
  Build :done crit, 5d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-invalid-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :2024-01-06, done
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-invalid-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :done, 2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-invalid-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :done, crit, des1, 2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-invalid-tag: error
gantt
  dateFormat YYYY-MM-DD
  Design :Done, 2024-01-06, 3d
```

## Options

This rule has no options.

## Further Reading

- [Gantt diagram syntax: tags](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gantt.md#L69)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gantt-no-invalid-tag.ts)
- [Tests source](../../tests/rules/gantt-no-invalid-tag.test.ts)

<!-- end auto-generated rule resources -->
