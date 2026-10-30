# @mmd-toolkit/gantt-no-duplicate-setting

Japanese version:
[gantt-no-duplicate-setting.ja.md](./gantt-no-duplicate-setting.ja.md)

Disallow a setting statement that sets its setting again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

`dateFormat`, `axisFormat`, `tickInterval`, `todayMarker`, `weekday`, and
`weekend` each set one value for the whole chart. mermaid.js accepts a later
setting without an error and applies it even to tasks written before it, so an
earlier setting is lost.

## Rule Details

This rule applies to Gantt charts (`gantt`). It reports a `dateFormat`,
`axisFormat`, `tickInterval`, `todayMarker`, `weekday`, or `weekend` statement
that replaces the current value of that setting with a different one. Repeating
the current value is not reported.

Values are compared as the text after the keyword and its following space,
including whitespace. `weekday` and `weekend` are compared in lower case, so
`weekday Monday` after `weekday monday` is not reported. Returning to an earlier
value after another value is reported: `dateFormat YYYY-MM-DD` after
`dateFormat DD-MM-YYYY` replaces it even if `YYYY-MM-DD` was used before.

`excludes` and `includes` are not reported because mermaid.js combines their
items. A repeated `inclusiveEndDates` changes nothing and is not reported
either.

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
