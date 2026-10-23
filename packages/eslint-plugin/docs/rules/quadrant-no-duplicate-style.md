# @mmd-toolkit/quadrant-no-duplicate-style

Japanese version:
[quadrant-no-duplicate-style.ja.md](./quadrant-no-duplicate-style.ja.md)

Disallow a style that a point or a class gives again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

The styles of a point and of a `classDef` are a list: `radius`, `color`,
`stroke-color`, and `stroke-width`, separated by commas. mermaid.js accepts a
style that the list gives twice, and the later value silently replaces the
earlier one: `radius: 5, radius: 9` gives the radius 9. A second value is
usually left over from editing the list.

## Rule Details

This rule reports a style of a point or of a `classDef` after the first one of
the same name in its list, when it gives a value other than the one before it.
It applies to `quadrantChart`.

After `color: #f00, radius: 5`, a later `color: #00f` in the same list gives the
colour `#00f`. A style of a point and a style of its class are not compared: the
style of the point wins, as the documentation of mermaid.js says.

A style that gives the value that the list already gave is not reported. Values
are compared as mermaid.js keeps them: a radius is a number, so `radius: 05`
after `radius: 5` is the same, and the spaces around the colon do not count; a
colour and a stroke width are compared as written, so `stroke-color: f00` after
`stroke-color: #f00` is reported. After `radius: 5` and `radius: 9`, a third
`radius: 5` is reported, because it replaces 9.

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
