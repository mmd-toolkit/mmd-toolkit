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

This rule applies to XY charts (`xychart` and `xychart-beta`). It reports each
value in a `line` or `bar` beyond the number of x-axis categories.

The categories are those of the last `x-axis` statement that gives categories or
a range; one with a title only keeps them, and after a range no plot is checked.
Only the plots after that statement are checked. A plot before it is not:
mermaid.js now gives each plot the x axis set before it, so that `x-axis [a, b]`
after `bar [1, 2, 3]` drops no value, and an open pull request (see Further
Reading) would give it the last x axis instead.

Fewer values than categories are not reported because nothing written is lost.

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

## Further Reading

- [#7798](https://github.com/mermaid-js/mermaid/pull/7798)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/xychart-no-extra-value.ts)
- [Tests source](../../tests/rules/xychart-no-extra-value.test.ts)

<!-- end auto-generated rule resources -->
