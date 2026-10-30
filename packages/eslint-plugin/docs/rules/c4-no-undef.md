# @mmd-toolkit/c4-no-undef

Japanese version: [c4-no-undef.ja.md](./c4-no-undef.ja.md)

Disallow a style update whose target does not exist when the update is read.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`UpdateElementStyle` and `UpdateRelStyle` change a target that exists when
mermaid.js reads the update. If an alias is misspelled or the update comes
before its target, mermaid.js accepts it without an error and changes nothing.

## Rule Details

This rule applies to C4 diagrams (`C4Context`, `C4Container`, `C4Component`,
`C4Dynamic`, and `C4Deployment`). It reports each `UpdateElementStyle` whose
alias matches no current element or boundary, and each `UpdateRelStyle` whose
ordered endpoints match no current relationship. Declarations make targets
available from that point on; the initial boundary `global` exists from the
start.

An update before its target is reported because it does not affect the later
declaration. Aliases are case-sensitive and compared as written after trimming
whitespace at the ends; mermaid.js converts character references and HTML
attribute quotes, so it may match aliases that this rule treats as different.

Relationship endpoints are ordered, including for `BiRel`, so reversing them is
reported. After `$alias`, `$from`, or `$to` in a declaration or an earlier
update renames a target, an update that uses the old name is reported. An
`UpdateRelStyle` for a relationship written with `$from` and `$to` in its
endpoint positions is always reported, because that relationship has no
endpoints that an update can name.

Relationships whose endpoints are undeclared are not reported: mermaid.js stops
with an error when drawing them.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-undef: error
C4Context
  Person(customer, "Customer")
  UpdateElementStyle(custmer, "red")
```

```mmd
%% eslint @mmd-toolkit/c4-no-undef: error
C4Context
  UpdateElementStyle(customer, "red")
  Person(customer, "Customer")
```

```mmd
%% eslint @mmd-toolkit/c4-no-undef: error
C4Context
  Person(a, "A")
  Person(b, "B")
  Rel(a, b, "Uses")
  UpdateRelStyle(b, a, "red")
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-undef: error
C4Context
  Person(customer, "Customer")
  UpdateElementStyle(customer, "red")
```

```mmd
%% eslint @mmd-toolkit/c4-no-undef: error
C4Context
  Person(a, "A")
  Person(b, "B")
  Rel(a, b, "Uses")
  UpdateRelStyle(a, b, "red")
```

## Options

This rule has no options.

## Related Rules

- [c4-no-invalid-attribute-key](./c4-no-invalid-attribute-key.md)
- [c4-no-redefined-element](./c4-no-redefined-element.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/c4-no-undef.ts)
- [Tests source](../../tests/rules/c4-no-undef.test.ts)

<!-- end auto-generated rule resources -->
