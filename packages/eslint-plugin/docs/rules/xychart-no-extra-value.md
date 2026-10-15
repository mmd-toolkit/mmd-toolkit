# @mmd-toolkit/xychart-no-extra-value

Japanese version: [xychart-no-extra-value.ja.md](./xychart-no-extra-value.ja.md)

Disallow a value of a plot beyond the categories of the x axis.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

With categories on the x axis, mermaid.js gives each value of a plot to the
category at its place. A value beyond the last category has no category, and
mermaid.js drops it without an error: `x-axis [jan, feb]` and `bar [10, 20, 30]`
draw two bars.

## Rule Details

This rule reports each value of a `line` or a `bar` beyond the number of the
categories of the x axis. It applies to `xychart`.

The categories are those of the last `x-axis` statement with data in the chart,
and the plots after that statement are checked against them; an `x-axis`
statement with a title only keeps the categories, and a range instead of
categories gives none, so that no plot is checked. A plot before that statement
is not checked: mermaid.js gives each plot the x axis at its own place, so that
after `bar [1, 2, 3]`, the statement `x-axis [a, b]` drops no value of it, and
[#7798](https://github.com/mermaid-js/mermaid/pull/7798) (open, for the approved
issue that an `x-axis` written after the data breaks the chart) gives the plots
the last x axis, which would change what such a plot drops. After
`x-axis [a, b, c, d]`, `bar [1]`, and `x-axis [a, b]`, the plot `bar [1, 2, 3]`
drops its third value, and it is reported. Fewer values than categories are not
reported: the categories without a value have no point or bar, and nothing
written is lost.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/xychart-no-extra-value: error
xychart
  x-axis [jan, feb]
  bar [10, 20, 30]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/xychart-no-extra-value: error
xychart
  x-axis [jan, feb, mar]
  bar [10, 20, 30]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-extra-value: error
xychart
  x-axis [jan, feb, mar]
  bar [10, 20]
```

## Options

This rule has no options.

## Related Rules

- [xychart-no-redefined-axis](./xychart-no-redefined-axis.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/xychart-no-extra-value.ts)
- [Tests source](../../tests/rules/xychart-no-extra-value.test.ts)

<!-- end auto-generated rule resources -->
