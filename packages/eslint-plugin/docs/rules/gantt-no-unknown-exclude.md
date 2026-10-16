# @mmd-toolkit/gantt-no-unknown-exclude

Japanese version:
[gantt-no-unknown-exclude.ja.md](./gantt-no-unknown-exclude.ja.md)

Disallow a word in `excludes` that is neither `weekends` nor the name of a day.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`excludes` leaves days out of the time that the tasks take: `weekends`, a day of
the week such as `sunday`, or a date. mermaid.js accepts any word there, and a
word that is none of these leaves out nothing, without an error. A misspelled
word, as `weekend`, lets the tasks run through the weekend.

## Rule Details

This rule reports an item of an `excludes` statement that holds no digit and is
not `weekends` or the name of a day of the week, `monday` to `sunday`, in any
case. It applies to `gantt`.

After `excludes weekend`, the task `Design :2024-01-05, 3d` takes the three days
from Friday 5 January, the weekend included; after `excludes weekends`, it skips
the weekend and ends on Tuesday. The same holds for `excludes sat, sun`, in
which both `sat` and `sun` are reported, and for `excludes weekdays`, which the
documentation of mermaid.js names as a word that it does not take. The case does
not matter: `excludes WeekEnds, Friday` leaves out the weekends and Fridays.

An item with a digit is a date, which mermaid.js compares with the dates of the
chart written in `YYYY-MM-DD` and in the form of `dateFormat`; the rule does not
check dates. `excludes 06-01-2024` with `dateFormat YYYY-MM-DD` leaves out no
day, and it is not reported. Neither are the items of `includes`.

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

## Background

mermaid.js lowers the items of `excludes` and leaves out a day when the list
holds `weekends` and the day is in the weekend, when it holds the name of the
day in English, or when it holds the date written in the form of `dateFormat` or
in `YYYY-MM-DD`
([`isInvalidDate`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L183-L201)).
Its documentation
([syntax/gantt.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gantt.md#L131))
says that `excludes` takes dates in `YYYY-MM-DD`, days of the week, and
`weekends`, but not the word `weekdays`.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gantt-no-unknown-exclude.ts)
- [Tests source](../../tests/rules/gantt-no-unknown-exclude.test.ts)

<!-- end auto-generated rule resources -->
