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

This rule applies to C4 diagrams (`C4Context`, `C4Container`, `C4Component`,
`C4Dynamic`, and `C4Deployment`). It reports a description that differs from the
latest preceding nonempty description, comparing all three forms together,
including inside boundaries. Repeating the same description is not reported.
After `accDescr: a` and `accDescr: b`, a third `accDescr: a` is reported,
because it replaces `b`.

CR and CRLF are compared as LF, and whitespace after a line feed is ignored.
`accDescription` keeps extra spaces after its first separator, while colon and
block forms trim whitespace at the ends.

An empty description block changes nothing and is neither reported nor used for
later comparisons. A colon form whose value is on a later line still sets that
value, including after blank, comment, or directive lines.

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
