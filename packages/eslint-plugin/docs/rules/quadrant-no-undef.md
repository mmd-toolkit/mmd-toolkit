# @mmd-toolkit/quadrant-no-undef

Japanese version: [quadrant-no-undef.ja.md](./quadrant-no-undef.ja.md)

Disallow a class of a point that no `classDef` defines.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A point takes the styles of a class with `:::`, as in `A:::c1: [0.3, 0.6]`. When
no `classDef` of the chart defines that class, as when its name is misspelled,
mermaid.js gives no error, and the class has no effect: the point keeps the
styles of its own and those of the theme.

## Rule Details

This rule applies to quadrant charts (`quadrantChart`). It reports each point
whose class name after `:::` has no matching `classDef` anywhere in the chart,
before or after the point. Names are case-sensitive, so `C1` does not name `c1`.
A point with its own styles is reported too, since its undefined class adds
nothing.

A point's class name consists of letters, digits, and `_`, while `classDef`
names may contain other characters: `A:::c` does not name the class `c-1`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-undef: error
quadrantChart
  Campaign A:::hot: [0.3, 0.6]
  classDef hit color: #f00
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-undef: error
quadrantChart
  Campaign A:::hot: [0.3, 0.6]
  classDef hot color: #f00
```

## Options

This rule has no options.

## Related Rules

- [quadrant-no-redefined-class](./quadrant-no-redefined-class.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/quadrant-no-undef.ts)
- [Tests source](../../tests/rules/quadrant-no-undef.test.ts)

<!-- end auto-generated rule resources -->
