# @mmd-toolkit/quadrant-no-invalid-color

Japanese version:
[quadrant-no-invalid-color.ja.md](./quadrant-no-invalid-color.ja.md)

Disallow a hexadecimal colour without `#` in the style of a point or a class.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

A point is drawn in the colour of its `color` style, and its border in the
colour of its `stroke-color` style. mermaid.js accepts three or six hexadecimal
digits without `#` in both without an error, but writes the text into the
drawing as it is, and a browser does not read `f00` as a colour. The point or
its border is not drawn in the colour written.

## Rule Details

This rule applies to quadrant charts (`quadrantChart`). It reports the `color`
or `stroke-color` style of a point or of a `classDef` when it is three or six
hexadecimal digits without `#` and a point is drawn with it: it is the last
style of its name in the styles of the point or, where the point has none, in
the last `classDef` of its class. A `stroke-color` is reported only where the
point is drawn with a border wider than 0px, by a `stroke-width` of the point or
of its class.

A style that a later style of the same name in the same list overwrites, a
`classDef` that no point takes, a `classDef` value that a style of the point
overwrites, and a `classDef` that a later `classDef` of the same class replaces
are not reported. `color: red` is not reported, because mermaid.js gives an
error for a value that is not a hexadecimal code.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-color: error
quadrantChart
  Point A: [0.3, 0.5] color: f00, radius: 12
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-color: error
quadrantChart
  classDef hot color: f00
  Point A:::hot: [0.3, 0.5]
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-color: error
quadrantChart
  Point A: [0.3, 0.5] stroke-color: f00, stroke-width: 2px
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-invalid-color: error
quadrantChart
  Point A: [0.3, 0.5] color: #f00, radius: 12
```

## Options

This rule has no options.

## Related Rules

- [quadrant-no-invalid-coordinate](./quadrant-no-invalid-coordinate.md)

<!-- begin auto-generated rule version -->

## Version

This rule has not been released yet.

<!-- end auto-generated rule version -->

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/quadrant-no-invalid-color.ts)
- [Tests source](../../tests/rules/quadrant-no-invalid-color.test.ts)

<!-- end auto-generated rule resources -->
