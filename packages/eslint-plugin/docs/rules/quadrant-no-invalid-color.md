# @mmd-toolkit/quadrant-no-invalid-color

Japanese version:
[quadrant-no-invalid-color.ja.md](./quadrant-no-invalid-color.ja.md)

Disallow a hexadecimal colour without `#` in the style of a point or a class.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

A point takes the colour of its `color` style. mermaid.js accepts three or six
hexadecimal digits without `#` there without an error, but writes the text into
the drawing as it is, and a browser does not read `f00` as a colour. The point
is not drawn in the colour written.

## Rule Details

This rule applies to quadrant charts (`quadrantChart`). It reports the `color`
style of a point or of a `classDef` when it is three or six hexadecimal digits
without `#`.

`color: red` is not reported, because mermaid.js gives an error for a value that
is not a hexadecimal code. The `stroke-color` style is not checked.

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
