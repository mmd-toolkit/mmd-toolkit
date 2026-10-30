# @mmd-toolkit/quadrant-no-redefined-axis

Japanese version:
[quadrant-no-redefined-axis.ja.md](./quadrant-no-redefined-axis.ja.md)

Disallow an axis statement that replaces a text of the axis.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`x-axis` sets the left and right texts of the x axis, and `y-axis` sets the
bottom and top texts of the y axis. mermaid.js accepts another statement for the
same axis without an error and replaces the texts that it sets, so earlier
labels can be lost.

## Rule Details

This rule applies to quadrant charts (`quadrantChart`). It reports an `x-axis`
or `y-axis` statement that replaces a nonempty text already set for that axis
with a different value. The axes are checked separately, and the keywords are
read in any case.

Keeping existing texts or adding a text where none was set is not reported. A
statement with one text keeps the second text. A quoted text of only spaces sets
an empty text, so `x-axis "  " --> R` after `x-axis L --> R` is reported. An
arrow with no text after it becomes part of the first text, so `x-axis L -->`
after `x-axis L --> R` is reported.

Texts are compared without surrounding whitespace or quotes; whitespace between
words counts, but arrow length does not. After `x-axis A --> B` and
`x-axis C --> D`, a third `x-axis A --> B` is reported because it replaces `C`
and `D`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-redefined-axis: error
quadrantChart
  x-axis Low Reach --> High Reach
  x-axis Low Cost --> High Cost
  A: [0.3, 0.6]
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-redefined-axis: error
quadrantChart
  y-axis Low --> High
  y-axis Small
  A: [0.3, 0.6]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-redefined-axis: error
quadrantChart
  x-axis Low Reach --> High Reach
  y-axis Low Engagement --> High Engagement
  A: [0.3, 0.6]
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-redefined-axis: error
quadrantChart
  x-axis Low Reach
  x-axis Low Reach --> High Reach
  A: [0.3, 0.6]
```

## Options

This rule has no options.

## Related Rules

- [quadrant-no-redefined-quadrant](./quadrant-no-redefined-quadrant.md)
- [xychart-no-redefined-axis](./xychart-no-redefined-axis.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/quadrant-no-redefined-axis.ts)
- [Tests source](../../tests/rules/quadrant-no-redefined-axis.test.ts)

<!-- end auto-generated rule resources -->
