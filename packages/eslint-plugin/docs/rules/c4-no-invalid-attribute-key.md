# @mmd-toolkit/c4-no-invalid-attribute-key

Japanese version:
[c4-no-invalid-attribute-key.ja.md](./c4-no-invalid-attribute-key.ja.md)

Disallow incorrect casing of the color and offset keys in C4 style updates.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`$BgColor="red"` is accepted, but stores the separate attribute `BgColor`. It
does not set `bgColor`, so the element does not get that background color. A
difference in case gives no parse error.

## Rule Details

This rule reports a named key that differs only in case from `bgColor`,
`fontColor`, or `borderColor` in an applied `UpdateElementStyle`, or from
`textColor`, `lineColor`, `offsetX`, or `offsetY` in an applied
`UpdateRelStyle`. It applies to `c4`.

Each key is checked without exterior whitespace, in the consumed optional
arguments only. Each incorrectly cased key produces one report. Element style
updates can reach a shape, a boundary, or the initial `global` boundary. The
target is found by its alias as written: mermaid.js turns character references,
as `#35;`, and the quotes of HTML attributes into other characters before it
reads an alias, so for an alias that differs only in those, mermaid.js and this
rule may find different targets.

The rule does not report other unfamiliar keys: mermaid.js keeps any named
attribute, and some keys that the documentation does not list, such as `alias`,
`from`, and `to`, change what later statements match. Keys in required argument
positions, excess arguments, and updates that have no current target are not
checked by this rule. A key in `UpdateLayoutConfig` is not checked either: its
position, not its name or case, selects the counter.

Use the key's exact case. Correctly spelled named offsets in a color slot are
not reported: mermaid.js stores them as strings and the renderer reads those
strings as offsets.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-invalid-attribute-key: error
C4Context
  Person(a, "A")
  UpdateElementStyle(a, $BgColor="red")
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-invalid-attribute-key: error
C4Context
  Person(a, "A")
  UpdateElementStyle(a, $bgColor="red")
```

```mmd
%% eslint @mmd-toolkit/c4-no-invalid-attribute-key: error
C4Context
  UpdateLayoutConfig($C4ShapeInRow="3", $C4BoundaryInRow="1")
```

## Options

This rule has no options.

## Related Rules

- [c4-no-undef](./c4-no-undef.md)
- [c4-no-useless-argument](./c4-no-useless-argument.md)

## Background

The element adapter reads the exact fields
[`bgColor`, `borderColor`, and `fontColor`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4ShapeAdapter.ts#L140-L156).
Relationship drawing reads the exact
[color and offset fields](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/svgDraw.ts#L26-L36).
This is about ignored field names, not whether a color value is valid CSS.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/c4-no-invalid-attribute-key.ts)
- [Tests source](../../tests/rules/c4-no-invalid-attribute-key.test.ts)

<!-- end auto-generated rule resources -->
