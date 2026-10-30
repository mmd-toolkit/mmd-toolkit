# @mmd-toolkit/c4-no-invalid-attribute-key

Japanese version:
[c4-no-invalid-attribute-key.ja.md](./c4-no-invalid-attribute-key.ja.md)

Disallow incorrect casing of the color and offset keys in C4 style updates.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js accepts `$BgColor="red"` without an error, but treats `BgColor` as a
separate attribute from `bgColor`. The element does not get the intended
background color.

## Rule Details

This rule applies to C4 diagrams (`C4Context`, `C4Container`, `C4Component`,
`C4Dynamic`, and `C4Deployment`). It reports named keys differing only in case
from `bgColor`, `fontColor`, or `borderColor` in `UpdateElementStyle`, or
`textColor`, `lineColor`, `offsetX`, or `offsetY` in `UpdateRelStyle`. Each key
is checked without whitespace at its ends, only in optional argument positions
that the call reads and only when the update has a target. Targets include
elements, boundaries, and the initial `global` boundary.

Other unfamiliar keys are not reported because named attributes such as `alias`,
`from`, and `to` can change what later statements match. Required positions and
excess arguments are not checked.

`UpdateLayoutConfig` is not checked because position selects the setting.
Correctly cased named offsets in color positions are not reported because
mermaid.js can use those values as offsets. This rule checks attribute names,
not whether color values are valid CSS.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/c4-no-invalid-attribute-key.ts)
- [Tests source](../../tests/rules/c4-no-invalid-attribute-key.test.ts)

<!-- end auto-generated rule resources -->
