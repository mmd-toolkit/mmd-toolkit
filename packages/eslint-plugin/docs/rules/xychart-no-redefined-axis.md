# @mmd-toolkit/xychart-no-redefined-axis

Japanese version:
[xychart-no-redefined-axis.ja.md](./xychart-no-redefined-axis.ja.md)

Disallow an axis statement that replaces the title or the data of the axis.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`x-axis` and `y-axis` set an axis's title and data: categories or a range.
mermaid.js accepts another statement for the same axis without an error: it
always sets the title, empty when omitted, and replaces the data when it gives
data, so earlier values can be lost.

## Rule Details

This rule applies to XY charts (`xychart` and `xychart-beta`). It reports an
`x-axis` or `y-axis` statement that replaces a title or data already set for the
same axis with a different value. The axes are checked separately, and the
keywords are read in any case.

A statement without a title is reported after a title, because it clears it; a
statement with only a title keeps the categories or the range and is not
reported for them. Adding a title or data without losing an existing value is
not reported. Replacing categories with a range is reported.

Unquoted words in titles and categories are joined without spaces, while quoted
text is compared without surrounding whitespace. After `x-axis A [a]` and
`x-axis B [b]`, a third `x-axis A [a]` is reported because it replaces `B` and
`b`.

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
