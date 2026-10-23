# @mmd-toolkit/c4-no-redefined-element

Japanese version:
[c4-no-redefined-element.ja.md](./c4-no-redefined-element.ja.md)

Disallow a declaration of an element or a boundary that replaces an earlier
label, kind, or type.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A shape alias identifies one element. When another declaration uses that alias,
mermaid.js updates the existing element in place. A different label or kind
replaces the earlier one without an error; it does not add a second element.

## Rule Details

This rule reports a shape declaration that changes the element kind, or replaces
a nonempty string label with a different string label. It applies to `c4`.

The comparison uses the current matching element, not the first declaration with
that written alias. After labels `First`, `Second`, `Second`, and `First`, the
second and fourth declarations are reported. Aliases and labels are trimmed as
mermaid.js reads their arguments, and case is significant. They are compared as
written: mermaid.js turns character references, as `#35;`, and the quotes of
HTML attributes into other characters before it reads an alias or a label, so
two aliases or labels that differ only in those may be the same for mermaid.js
and different for this rule. A successful optional `$alias` assignment changes
which alias later declarations match; an optional `$label` is applied before
labels are compared.

Writing the same kind and label again is not reported. Giving an element its
first nonempty label is not reported either, while a declaration that leaves out
its label, as `Person(a,)`, gives the empty label and is reported after
`Person(a, "First")`. Omitted technology and description keep their earlier
values: after `Container(a, "API", "Java", "Payments")`, `Container(a, "API")`
keeps both. The rule compares labels and kinds, not optional descriptions,
technology, parent changes, or style updates. A raw label written by a style
update is not a declaration's string label and is not compared.

A boundary is compared in the same way, by its label and its type. A boundary
written again with the same label adds the elements of its body to it, and it is
not reported. A different label is reported, and so is a different type: the
type that the keyword gives, as `ENTERPRISE` for `Enterprise_Boundary`, or the
type written as the third argument of `Boundary` or `Node`. A boundary written
again without a type takes the default type of its keyword, `system` or `node`,
so after `Boundary(b, "Bank", "company")`, the declaration `Boundary(b, "Bank")`
loses the type `company` and is reported; a default type that nobody wrote and
an empty type are not counted as lost. The initial boundary `global` has no
label or type that the author wrote, so a declaration of `global` is not
compared.

Elements and boundaries have separate aliases. An element that uses the alias of
a boundary is not a second declaration of either, and it is not reported.
Repeated relationship pairs are outside this rule.

Give separate elements different aliases, or write their kind and label once.

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
