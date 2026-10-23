# @mmd-toolkit/c4-no-duplicate-description

Japanese version:
[c4-no-duplicate-description.ja.md](./c4-no-duplicate-description.ja.md)

Disallow a description statement that replaces a different diagram description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`accDescription`, `accDescr:`, and nonempty `accDescr { ... }` set one shared
description. mermaid.js accepts a different second description without an error,
and the earlier description is lost.

## Rule Details

This rule reports a description setter whose stored value differs from the
latest preceding nonempty description setter. It applies to `c4`.

All three forms are compared together, also inside boundaries. A third statement
is compared with the second, not the first. Repeating the same stored
description is not reported. CR and CRLF become LF, and whitespace following a
line feed is removed when the description is stored; differences only in that
indentation are not reported. `accDescription` keeps extra spaces after its
first separator, while the colon and block forms trim exterior whitespace.

An empty description block changes nothing and is neither reported nor used as a
preceding setter. A colon form whose value is on a later line does set that
value, including after blank, comment, or directive lines. Formatting may join
that value onto its colon line; the replacement of the earlier description still
happens.

Keep one description, using a block for multiple lines.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-description: error
C4Context
  accDescr: Customers
  accDescr: Administrators
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-description: error
C4Context
  accDescription Customers
  accDescr { Administrators }
  accDescr: Customers
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-description: error
C4Context
  accDescription Customers
  accDescr { Customers }
  accDescr: Customers
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-description: error
C4Context
  accDescr: Customers
  accDescr {}Person(a, "A")
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-description: error
C4Context
  accDescr { Customers
  use the bank }
  accDescr { Customers
 use the bank }
```

## Options

This rule has no options.

## Related Rules

- [c4-no-duplicate-title](./c4-no-duplicate-title.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/c4-no-duplicate-description.ts)
- [Tests source](../../tests/rules/c4-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
