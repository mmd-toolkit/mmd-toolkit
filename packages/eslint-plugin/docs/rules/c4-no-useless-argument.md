# @mmd-toolkit/c4-no-useless-argument

Japanese version: [c4-no-useless-argument.ja.md](./c4-no-useless-argument.ja.md)

Disallow nonempty arguments beyond the parameters that a C4 call reads.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js accepts more arguments than a call reads. A value beyond the last
parameter disappears from the Db without an error. An extra empty slot can push
a link or another value past that limit.

## Rule Details

This rule reports each nonempty positional or named argument beyond the called
family's limit. It applies to `c4`.

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

Every argument entry counts, including empty entries and named attributes. For
example, a seventh argument of `Person` cannot set its link: the link is the
sixth argument. A named argument beyond the limit is ignored too, whatever its
key. Updates with no existing target have the same argument limits.

Null entries, empty quoted strings, and whitespace-only extra values are not
reported: they supply no nonempty value to lose. A trailing comma supplies no
extra argument. Required arguments, the discarded index of `RelIndex`, and the
deployment node's ignored fifth sprite slot are not excess arguments and are not
reported by this rule.

Remove an accidentally inserted empty entry, or put the value in its family's
consumed position.

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
