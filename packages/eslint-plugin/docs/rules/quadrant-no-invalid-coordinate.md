# @mmd-toolkit/quadrant-no-invalid-coordinate

Japanese version:
[quadrant-no-invalid-coordinate.ja.md](./quadrant-no-invalid-coordinate.ja.md)

Disallow a coordinate of a point that is not a number from 0 to 1.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

A point's coordinates are numbers from 0 to 1. mermaid.js also accepts text such
as `0,3` or `0x5` without an error, but reads it as a JavaScript number when
drawing: `0,3` is not a number, and `0x5` is 5, so the point is not drawn at its
intended place in the chart.

## Rule Details

This rule applies to quadrant charts (`quadrantChart`). It reports each
coordinate that JavaScript does not read as a number from 0 to 1, inclusive.
Coordinates such as `0,3`, `0 3`, and `0b2` are not numbers; `0x5` and `003` are
numbers outside the range.

Numeric forms such as `0e5` and `0b1` are not reported because their values are
0 and 1. `1.5`, `-0.5`, and `1.0` are not reported, because mermaid.js gives an
error for them.

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
