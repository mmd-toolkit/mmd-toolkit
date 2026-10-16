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

This rule reports the class name of a point that is the name of no `classDef` of
the chart. It applies to `quadrantChart`.

The classes of a chart are those that its `classDef` statements define, before
or after the point. After `classDef c1 color: #f00`, the point `A:::c2` keeps
the colour of the theme. Names are compared with their case: `A:::C1` does not
take the class `c1`. A point with styles of its own is reported in the same way,
since its class adds nothing, and every point that names such a class is
reported. The class name of a point is a word of letters, digits, and `_`, while
the name of a class of `classDef` may hold other characters: `A:::c` does not
take the class `c-1`.

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
