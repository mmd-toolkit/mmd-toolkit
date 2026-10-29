# @mmd-toolkit/c4-no-redefined-element

Japanese version:
[c4-no-redefined-element.ja.md](./c4-no-redefined-element.ja.md)

Disallow a declaration of an element or a boundary that replaces an earlier
label, kind, or type.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A shape alias identifies one element. mermaid.js accepts another declaration
with that alias without an error and updates the element in place. A different
label or kind replaces the earlier one instead of adding a second element.

## Rule Details

This rule applies to C4 diagrams (`C4Context`, `C4Container`, `C4Component`,
`C4Dynamic`, and `C4Deployment`). It reports a declaration that changes an
element's kind or replaces a nonempty string label with a different string
label. It compares the current matching element, so after `First`, `Second`,
`Second`, and `First`, the second and fourth labels are reported. Aliases and
labels are case-sensitive and compared as written after trimming whitespace at
the ends; character references and HTML attribute quotes may make mermaid.js
read them differently.

An optional `$alias` changes what later declarations match, and an optional
`$label` is applied before comparison. Repeating the same kind and label or
giving a first nonempty label is not reported. Omitting the label, as in
`Person(a,)`, is reported after a nonempty label.

Optional descriptions, technology, parent changes, and style updates are not
compared; omitted technology and description keep their earlier values. Labels
written directly by style updates are not compared as declaration labels.

Boundaries are compared by label and type; repeating the same label can add body
elements without a report. Changing a type given by the keyword or a third
argument is reported, including losing a written type to the keyword's default
`system` or `node`. An unwritten default type and an empty type are not counted
as earlier values to lose, and a declaration of the boundary `global` is not
reported.

Elements and boundaries have separate aliases, so sharing an alias between them
is not reported. Repeated relationship pairs are not checked.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-redefined-element: error
C4Context
  Person(a, "Customer")
  Person(a, "Administrator")
```

```mmd
%% eslint @mmd-toolkit/c4-no-redefined-element: error
C4Context
  Person(a, "Customer")
  System(a, "Customer")
```

```mmd
%% eslint @mmd-toolkit/c4-no-redefined-element: error
C4Context
  Boundary(bank, "Bank") {
    Person(customer, "Customer")
  }
  Boundary(bank, "Branch") {
    System(atm, "ATM")
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-redefined-element: error
C4Context
  Person(customer, "Customer")
  Person(admin, "Administrator")
```

```mmd
%% eslint @mmd-toolkit/c4-no-redefined-element: error
C4Context
  Person(a, "Customer")
  Person(a, "Customer")
```

```mmd
%% eslint @mmd-toolkit/c4-no-redefined-element: error
C4Context
  Container(a, "API", "Java", "Payments")
  Container(a, "API")
```

```mmd
%% eslint @mmd-toolkit/c4-no-redefined-element: error
C4Context
  Person(a, "")
  Person(a, "Customer")
```

```mmd
%% eslint @mmd-toolkit/c4-no-redefined-element: error
C4Context
  Boundary(bank, "Bank") {
    Person(customer, "Customer")
  }
  Boundary(bank, "Bank") {
    System(atm, "ATM")
  }
```

## Options

This rule has no options.

## Related Rules

- [c4-no-undef](./c4-no-undef.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/c4-no-redefined-element.ts)
- [Tests source](../../tests/rules/c4-no-redefined-element.test.ts)

<!-- end auto-generated rule resources -->
