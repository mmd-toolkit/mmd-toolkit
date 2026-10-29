# @mmd-toolkit/quadrant-no-redefined-class

Japanese version:
[quadrant-no-redefined-class.ja.md](./quadrant-no-redefined-class.ja.md)

Disallow a `classDef` statement that replaces the styles of its class.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

`classDef` defines a class that points take with `:::`. mermaid.js accepts a
second `classDef` of the same name, and the class then has the styles of the
last definition only: the styles of the earlier one are lost without an error,
also those that the later one does not name.

## Rule Details

This rule applies to quadrant charts (`quadrantChart`). It reports a `classDef`
that drops a style of the same class or changes its value. A definition that
keeps all existing styles is not reported, even when it adds styles. Class names
are case-sensitive, while the keyword is read in any case.

Style order does not count, radii are compared as numbers, and the last value of
a repeated style in one definition is used. Colours and stroke widths are
compared as written, so changing `#f00` to `#F00` is reported. Definitions of
other classes between two definitions do not affect the comparison, and a
definition after the points that take the class is reported too, because they
take the last definition wherever they are written. After definitions of `c`
with `color: #f00` and `color: #00f`, a third with `color: #f00` is reported
because it replaces `#00f`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-redefined-class: error
quadrantChart
  A:::c: [0.3, 0.6]
  classDef c color: #f00
  classDef c radius: 9
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-redefined-class: error
quadrantChart
  A:::c: [0.3, 0.6]
  classDef c color: #f00, radius: 9
```

## Options

This rule has no options.

## Related Rules

- [quadrant-no-duplicate-style](./quadrant-no-duplicate-style.md)
- [quadrant-no-undef](./quadrant-no-undef.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/quadrant-no-redefined-class.ts)
- [Tests source](../../tests/rules/quadrant-no-redefined-class.test.ts)

<!-- end auto-generated rule resources -->
