# @mmd-toolkit/c4-no-duplicate-style

Japanese version: [c4-no-duplicate-style.ja.md](./c4-no-duplicate-style.ja.md)

Disallow a style update that replaces a value that an earlier update gave.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`UpdateElementStyle` and `UpdateRelStyle` update the style of an element,
boundary, or relationship. Each supplied style attribute replaces its earlier
value without an error, so a later background color can erase an earlier one.

## Rule Details

This rule applies to C4 diagrams (`C4Context`, `C4Container`, `C4Component`,
`C4Dynamic`, and `C4Deployment`). It reports an argument that changes a style
attribute set by an earlier update or an earlier argument in the same update.
Repeating a value or setting an attribute for the first time is not reported.
After `$bgColor="red"` and `$bgColor="blue"`, a third `$bgColor="red"` is
reported, because it replaces `blue`. Empty arguments set empty values; when one
replaces an earlier value, the update is reported.

Only updates that find a target are compared: the first matching element,
otherwise boundary, or the first relationship with matching endpoints in order,
declared before the update. The initial boundary `global` is also a target.
Named `$alias`, `$from`, and `$to` change what later updates find and are not
compared.

An argument's position or named key selects its attribute, so
`UpdateElementStyle(a, "red", $bgColor="blue")` sets `bgColor` twice. Keys are
compared with their case: `$BgColor` is another attribute and is not compared
with `$bgColor`; [c4-no-invalid-attribute-key](./c4-no-invalid-attribute-key.md)
reports it. Declaration values are not compared; a declaration resets
comparisons only for the attributes it writes.

Values are compared with whitespace at the ends removed and otherwise as
written. Character references and HTML attribute quotes may therefore differ for
this rule while mermaid.js reads them alike. The offsets in positions five and
six of `UpdateRelStyle` are also compared as written, so `10` and `010` can be
reported as different although mermaid.js reads both as the same whole number.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-style: error
C4Context
  Person(a, "A")
  UpdateElementStyle(a, $bgColor="red")
  UpdateElementStyle(a, $bgColor="blue")
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-style: error
C4Context
  Person(a, "A")
  UpdateElementStyle(a, $bgColor="red")
  UpdateElementStyle(a, , "white")
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-style: error
C4Context
  Person(a, "A")
  UpdateElementStyle(a, $bgColor="red")
  UpdateElementStyle(a, $fontColor="white")
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-style: error
C4Context
  Person(a, "A")
  Person(b, "B")
  Rel(a, b, "Uses")
  UpdateRelStyle(a, b, $textColor="red", $lineColor="blue")
```

## Options

This rule has no options.

## Related Rules

- [c4-no-undef](./c4-no-undef.md)
- [c4-no-invalid-attribute-key](./c4-no-invalid-attribute-key.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/c4-no-duplicate-style.ts)
- [Tests source](../../tests/rules/c4-no-duplicate-style.test.ts)

<!-- end auto-generated rule resources -->
