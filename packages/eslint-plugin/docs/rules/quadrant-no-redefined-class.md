# @mmd-toolkit/quadrant-no-redefined-class

Japanese version:
[quadrant-no-redefined-class.ja.md](./quadrant-no-redefined-class.ja.md)

Disallow a `classDef` statement that replaces the styles of its class.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`classDef` defines a class that points take with `:::`. mermaid.js accepts a
second `classDef` of the same name, and the class then has the styles of the
last definition only: the styles of the earlier one are lost without an error,
also those that the later one does not name.

## Rule Details

This rule reports a `classDef` statement after the first one of the same name,
when it gives the class styles other than those it had. It applies to
`quadrantChart`.

After `classDef c color: #f00`, the statement `classDef c radius: 9` gives the
class `c` the radius 9 and no colour. The names of classes are compared with
their case, so `classDef C` defines another class than `classDef c`. The keyword
is read in any case. Where a point stands does not count: a point takes the
class of the last definition, also when the point is written first.

A definition that gives the same styles is not reported. Styles are compared as
mermaid.js keeps them: the order of the styles does not count, a radius is a
number, so `radius: 05` is `radius: 5`, and of a style written twice in one
definition the last value counts; a colour and a stroke width are compared as
written, so `#F00` after `#f00` is reported. With `classDef d` between them,
`classDef c` is compared with the earlier `classDef c`. After `classDef c` with
`color: #f00` and with `color: #00f`, a third one with `color: #f00` is
reported, because it replaces `#00f`.

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
