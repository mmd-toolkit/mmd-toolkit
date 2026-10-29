# @mmd-toolkit/quadrant-no-duplicate-style

Japanese version:
[quadrant-no-duplicate-style.ja.md](./quadrant-no-duplicate-style.ja.md)

Disallow a style that a point or a class gives again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

The styles of a point and a `classDef` are written as a comma-separated list.
When the same style is given twice, mermaid.js uses the later value without an
error, and the earlier value is lost.

## Rule Details

This rule applies to quadrant charts (`quadrantChart`). It reports a `radius`,
`color`, `stroke-color`, or `stroke-width` in a point's or `classDef`'s style
list that replaces, with a different value, the value that the same list gave
that style earlier. Repeating that value is not reported. Styles on a point and
its class are not compared because the point's styles take precedence.

Radii are compared as numbers and spaces around the colon do not count, so
`radius: 05` repeats `radius: 5`. Colours and stroke widths are compared as
written, so `stroke-color: f00` after `stroke-color: #f00` is reported. After
`radius: 5` and `radius: 9`, a third `radius: 5` is reported because it
replaces 9.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-style: error
quadrantChart
  Campaign A: [0.3, 0.6] radius: 5, color: #f00, radius: 9
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-style: error
quadrantChart
  Campaign A: [0.3, 0.6] radius: 9, color: #f00
```

## Options

This rule has no options.

## Related Rules

- [quadrant-no-redefined-class](./quadrant-no-redefined-class.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/quadrant-no-duplicate-style.ts)
- [Tests source](../../tests/rules/quadrant-no-duplicate-style.test.ts)

<!-- end auto-generated rule resources -->
