# @mmd-toolkit/c4-no-useless-argument

Japanese version: [c4-no-useless-argument.ja.md](./c4-no-useless-argument.ja.md)

Disallow nonempty arguments beyond the parameters that a C4 call reads.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js accepts more arguments than a call reads and ignores values beyond
the last parameter without an error. An extra empty position can push a link or
another intended value past that limit.

## Rule Details

This rule applies to C4 diagrams (`C4Context`, `C4Container`, `C4Component`,
`C4Dynamic`, and `C4Deployment`). It reports each nonempty positional or named
argument beyond the call's limit.

| Call family                                                    | Last consumed written position |
| -------------------------------------------------------------- | ------------------------------ |
| Person and System, including their variants                    | 6                              |
| Container and Component, including their variants              | 7                              |
| `Boundary`                                                     | 5                              |
| `Enterprise_Boundary`, `System_Boundary`, `Container_Boundary` | 4                              |
| `Deployment_Node`, `Node`, `Node_L`, `Node_R`                  | 7                              |
| Relationships except `RelIndex`                                | 8                              |
| `RelIndex`                                                     | 9                              |
| `UpdateElementStyle`                                           | 10                             |
| `UpdateRelStyle`                                               | 6                              |
| `UpdateLayoutConfig`                                           | 2                              |

Empty arguments and named attributes count as positions, and a named argument
beyond the limit is reported whatever its key, because mermaid.js ignores it
too. Updates without a current target have the same limits.

Empty entries, empty strings, and whitespace-only extra values are not reported
because they lose no nonempty value. A trailing comma adds no argument. Required
arguments, the discarded index of `RelIndex`, and a deployment node's ignored
fifth sprite position are within the limits and are not reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-useless-argument: error
C4Context
  Person(customer, "Customer", "A bank customer", "", "external", "", "https://bank.example")
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-useless-argument: error
C4Context
  Person(customer, "Customer", "A bank customer", "", "external", "https://bank.example")
```

```mmd
%% eslint @mmd-toolkit/c4-no-useless-argument: error
C4Context
  Person(a, "A", "D", "s", "t", "l", "")
```

```mmd
%% eslint @mmd-toolkit/c4-no-useless-argument: error
C4Deployment
  Node(n, "Node", "Linux", "Host", "server") {
    Person(a, "A")
  }
```

## Options

This rule has no options.

## Related Rules

- [c4-no-invalid-attribute-key](./c4-no-invalid-attribute-key.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/c4-no-useless-argument.ts)
- [Tests source](../../tests/rules/c4-no-useless-argument.test.ts)

<!-- end auto-generated rule resources -->
