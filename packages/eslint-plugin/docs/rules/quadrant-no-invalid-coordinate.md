# @mmd-toolkit/quadrant-no-invalid-coordinate

Japanese version:
[quadrant-no-invalid-coordinate.ja.md](./quadrant-no-invalid-coordinate.ja.md)

Disallow a coordinate of a point that is not a number from 0 to 1.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

The documentation of mermaid.js gives the coordinates of a point as numbers from
0 to 1, as in `A: [0.3, 0.6]`. mermaid.js also accepts a coordinate written with
another character in the place of the decimal point, as in `0,3`, and keeps the
text as it was written. Where it draws the point, it reads the text as a number
of JavaScript: `0,3` and `0 3` are no number, and the point is not drawn at its
place in the chart, without an error; `0x5` is the hexadecimal number 5, far
outside the chart.

## Rule Details

This rule reports a coordinate of a point that mermaid.js does not read as a
number from 0 to 1: one that is no number of JavaScript, as `0,3`, `0 3`, or
`0b2`, and one that is a number outside 0 to 1, as `0x5` or `003`, which is 3.
It applies to `quadrantChart`.

A coordinate that JavaScript reads as a number from 0 to 1 is not reported, also
where it is not written as the documentation of mermaid.js writes it: `0e5` is 0
and `0b1` is 1, and the point is drawn at that place.

A decimal comma, as in `A: [0,3, 0,6]`, gives two such coordinates, and both are
reported. Each coordinate is checked on its own: `A: [0.3, 0,6]` reports the
second one. A coordinate of more than 1, as `1.5`, or below 0, as `-0.5`, is
rejected by mermaid.js, and so is `1.0`, so they are not reported. A directive
inside a coordinate is removed before it is read.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-coordinate: error
quadrantChart
  Campaign A: [0,3, 0,6]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-coordinate: error
quadrantChart
  Campaign A: [0.3, 0.6]
```

## Options

This rule has no options.

## Related Rules

- [journey-no-invalid-score](./journey-no-invalid-score.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/quadrant-no-invalid-coordinate.ts)
- [Tests source](../../tests/rules/quadrant-no-invalid-coordinate.test.ts)

<!-- end auto-generated rule resources -->
