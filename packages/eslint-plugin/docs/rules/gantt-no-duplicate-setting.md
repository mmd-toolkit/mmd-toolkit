# @mmd-toolkit/gantt-no-duplicate-setting

Japanese version:
[gantt-no-duplicate-setting.ja.md](./gantt-no-duplicate-setting.ja.md)

Disallow a setting statement that sets its setting again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`dateFormat`, `axisFormat`, `tickInterval`, `todayMarker`, `weekday`, and
`weekend` each set one value for the whole chart. mermaid.js accepts every such
statement, and each one silently replaces the value set before it, also for the
tasks written before it. A second statement is usually left over from pasting a
part twice, or written in the belief that it changes the setting for the tasks
after it.

## Rule Details

This rule reports every statement of these six settings after the first one of
the same setting, when it sets a value other than the one before it. It applies
to `gantt`.

After `dateFormat DD-MM-YYYY`, `Design :01-02-2024, 3d`,
`dateFormat YYYY-MM-DD`, and `Build :2024-02-05, 5d`, mermaid.js reads the dates
of both tasks with `YYYY-MM-DD`: `01-02-2024` is no date of that form, and
mermaid.js passes it to the `Date` of JavaScript, which reads it as 2 January
2024 in Node.js, not as 1 February. The other settings are replaced in the same
way: after `axisFormat %m-%d` and `axisFormat %d`, the axis shows the days only.
A statement that sets the value that the setting already has is not reported:
the value stays, and nothing is lost. Values are compared as mermaid.js keeps
them: the text after the keyword and the space after it, whitespace included,
and for `weekday` and `weekend` in lower case, so `weekday Monday` after
`weekday monday` sets the same value. After `dateFormat YYYY-MM-DD` and
`dateFormat DD-MM-YYYY`, a third `dateFormat YYYY-MM-DD` is reported, because it
replaces `DD-MM-YYYY`.

`excludes` and `includes` are not reported: mermaid.js adds the items of every
such statement together. Neither is a second `inclusiveEndDates`, which changes
nothing.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-setting: error
gantt
  dateFormat DD-MM-YYYY
  Design :01-02-2024, 3d
  dateFormat YYYY-MM-DD
  Build :2024-02-05, 5d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-setting: error
gantt
  dateFormat YYYY-MM-DD
  axisFormat %m-%d
  axisFormat %d
  Design :2024-01-06, 3d
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-setting: error
gantt
  dateFormat YYYY-MM-DD
  axisFormat %m-%d
  Design :2024-02-01, 3d
  Build :2024-02-05, 5d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-setting: error
gantt
  dateFormat YYYY-MM-DD
  Design :2024-02-01, 3d
  dateFormat YYYY-MM-DD
  Build :2024-02-05, 5d
```

## Options

This rule has no options.

## Related Rules

- [gantt-no-duplicate-title](./gantt-no-duplicate-title.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gantt-no-duplicate-setting.ts)
- [Tests source](../../tests/rules/gantt-no-duplicate-setting.test.ts)

<!-- end auto-generated rule resources -->
