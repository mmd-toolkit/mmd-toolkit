# @mmd-toolkit/gantt-no-unknown-exclude

Japanese version:
[gantt-no-unknown-exclude.ja.md](./gantt-no-unknown-exclude.ja.md)

Disallow a word in `excludes` that is neither `weekends` nor the name of a day.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

`excludes` leaves days out of the time that the tasks take: `weekends`, a day of
the week such as `sunday`, or a date. mermaid.js accepts any word there, and a
word that is none of these leaves out nothing, without an error. A misspelled
word, as `weekend`, lets the tasks run through the weekend.

## Rule Details

This rule applies to Gantt charts (`gantt`). It reports an `excludes` item with
no digit that is neither `weekends` nor a full English weekday name from
`monday` to `sunday`, so abbreviations such as `sat` and the word `weekdays` are
reported. The comparison ignores case, so `WeekEnds` and `Friday` are not
reported.

An item with a digit is read as a date and is not checked, also when it leaves
out no day, as `excludes 06-01-2024` with `dateFormat YYYY-MM-DD`. Items in
`includes` are not checked either.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-unknown-exclude: error
gantt
  dateFormat YYYY-MM-DD
  excludes weekend
  Design :2024-01-05, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-unknown-exclude: error
gantt
  dateFormat YYYY-MM-DD
  excludes sat, sun
  Design :2024-01-05, 3d
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-unknown-exclude: error
gantt
  dateFormat YYYY-MM-DD
  excludes weekends
  Design :2024-01-05, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-unknown-exclude: error
gantt
  dateFormat YYYY-MM-DD
  excludes saturday, sunday, 2024-01-08
  Design :2024-01-05, 3d
```

## Options

This rule has no options.

## Further Reading

- [Gantt diagram syntax: excludes](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gantt.md#L131)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gantt-no-unknown-exclude.ts)
- [Tests source](../../tests/rules/gantt-no-unknown-exclude.test.ts)

<!-- end auto-generated rule resources -->
