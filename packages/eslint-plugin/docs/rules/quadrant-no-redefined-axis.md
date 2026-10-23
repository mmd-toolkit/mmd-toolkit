# @mmd-toolkit/quadrant-no-redefined-axis

Japanese version:
[quadrant-no-redefined-axis.ja.md](./quadrant-no-redefined-axis.ja.md)

Disallow an axis statement that replaces a text of the axis.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`x-axis` sets the left and the right text of the x axis, and `y-axis` the bottom
and the top text of the y axis. mermaid.js accepts a second statement of the
same axis and silently replaces what the first one set: every statement sets the
first text, and a statement with two texts sets the second one too.

## Rule Details

This rule reports an `x-axis` or a `y-axis` statement after the first one of the
same axis, when it replaces a text that an earlier statement of that axis set
with another value. It applies to `quadrantChart`.

After `x-axis Low --> High`, the statement `x-axis Cost --> Value` replaces both
texts, and `x-axis Cheap` replaces the left text and keeps `High`. An arrow with
no text after it adds an arrow to the first text: after `x-axis L --> R`, the
statement `x-axis L -->` gives the left text `L ⟶`, and it is reported. A text
in quotes that holds only spaces sets the empty text: after `x-axis L --> R`,
`x-axis "  " --> R` leaves the left text empty, and it is reported. The keywords
are read in any case, and the x axis and the y axis are counted apart.

A statement that loses nothing is not reported: after `x-axis Low --> High`, the
statement `x-axis Low` keeps both texts, and after `x-axis Low`, the statement
`x-axis Low --> High` keeps the left text and adds the right one; a text that
was empty is not lost either. Texts are compared as mermaid.js keeps them,
without the whitespace at their ends, so `x-axis "Low" --> " High "` after
`x-axis Low --> High` sets the same texts; the whitespace between the words
counts, so `x-axis Low cost` after `x-axis Low  cost` is reported. The length of
the arrow does not count. After `x-axis A --> B` and `x-axis C --> D`, a third
`x-axis A --> B` is reported, because it replaces `C` and `D`.

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
