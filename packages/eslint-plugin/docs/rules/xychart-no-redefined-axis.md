# @mmd-toolkit/xychart-no-redefined-axis

Japanese version:
[xychart-no-redefined-axis.ja.md](./xychart-no-redefined-axis.ja.md)

Disallow an axis statement that replaces the title or the data of the axis.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`x-axis` and `y-axis` set the title and the data of an axis: the categories or
the range. mermaid.js accepts a second statement of the same axis and silently
replaces what the first one set: every statement sets the title, the empty title
when it has none, and a statement with data replaces the data.

## Rule Details

This rule reports an `x-axis` or a `y-axis` statement after the first one of the
same axis, when it replaces a title or data that an earlier statement of that
axis set with another value. It applies to `xychart`.

After `x-axis Month [jan, feb]`, the statement `x-axis Year [2023, 2024]` gives
the axis the title `Year` and the categories `2023` and `2024`. After
`y-axis Revenue`, the statement `y-axis 0 --> 100` gives the range and the empty
title, and the title `Revenue` is lost. After `x-axis [a, b]`, the statement
`x-axis 0 --> 10` replaces the categories with the range. The keywords are read
in any case, and the x axis and the y axis are counted apart.

A statement that loses nothing is not reported: after `x-axis [a, b]`, the
statement `x-axis Month` adds the title and keeps the categories, and after
`y-axis T`, the statement `y-axis T 0 --> 10` keeps the title and adds the
range. Values are compared as mermaid.js keeps them: a title or a category in
words is joined without the spaces between its words, and a text in quotes is
read without the whitespace at its ends, so `x-axis "T" ["a"]` after
`x-axis T [a]` sets the same axis. After `x-axis A [a]` and `x-axis B [b]`, a
third `x-axis A [a]` is reported, because it replaces `B` and `b`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/xychart-no-redefined-axis: error
xychart
  x-axis Month [jan, feb]
  x-axis Year [2023, 2024]
  line [1, 2]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-redefined-axis: error
xychart
  y-axis Revenue
  y-axis 0 --> 100
  line [1, 2]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/xychart-no-redefined-axis: error
xychart
  x-axis Month [jan, feb]
  y-axis Revenue 0 --> 100
  line [1, 2]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-redefined-axis: error
xychart
  x-axis [jan, feb]
  x-axis Month
  line [1, 2]
```

## Options

This rule has no options.

## Related Rules

- [xychart-no-duplicate-title](./xychart-no-duplicate-title.md)
- [xychart-no-extra-value](./xychart-no-extra-value.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/xychart-no-redefined-axis.ts)
- [Tests source](../../tests/rules/xychart-no-redefined-axis.test.ts)

<!-- end auto-generated rule resources -->
