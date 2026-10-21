# @mmd-toolkit/c4-no-undef

Japanese version: [c4-no-undef.ja.md](./c4-no-undef.ja.md)

Disallow a style update whose target does not exist when the update is read.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`UpdateElementStyle` and `UpdateRelStyle` change the style of an element, a
boundary, or a relationship that exists when mermaid.js reads the update. When
no such target exists, as when its alias is misspelled or the update is written
before its target, mermaid.js accepts the update without an error and changes
nothing.

## Rule Details

This rule reports the target of an `UpdateElementStyle` that no element or
boundary has when the update is read, and an `UpdateRelStyle` whose ordered pair
of endpoints no relationship has when it is read. It applies to `c4`.

An element, a boundary, and a relationship exist from their declaration on, and
the initial boundary `global` exists from the start. After
`Person(customer, "Customer")`, `UpdateElementStyle(custmer, "red")` changes
nothing. An update written before its target is reported too: mermaid.js applies
nothing to the declaration that follows, and the documentation of mermaid.js
writes the updates at the end of the diagram. Aliases are compared with their
case and without the whitespace at their ends. They are compared as written:
mermaid.js turns character references, as `#35;`, and the quotes of HTML
attributes into other characters before it reads an alias, so two aliases that
differ only in those may be one alias for mermaid.js and two for this rule.

A relationship keeps its endpoints in the order written, also for `BiRel`: after
`Rel(a, b, "Uses")`, `UpdateRelStyle(b, a, "red")` changes nothing. A named
`$alias`, `$from`, or `$to` in a declaration or an earlier update changes what
later updates find: after `Person(a, "A")` and
`UpdateElementStyle(a, $alias="b")`, the update `UpdateElementStyle(a, "red")`
changes nothing. A relationship written with `$from` and `$to` in the places of
its endpoints has no endpoints that an update can name. Each update of a missing
target is reported.

A relationship whose endpoint no element or boundary declares is not reported:
mermaid.js accepts it, but drawing the diagram stops with an error that names
the relationship.

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

## Background

[`updateElStyle` and `updateRelStyle`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Db.ts#L494-L670)
look up the target that exists when they are called, and
[`getC4Shape`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Db.ts#L693-L700)
looks for a boundary when no element matches. For a relationship whose endpoint
is unknown,
[`drawRels`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/c4/c4Renderer.ts#L416-L422)
throws an error.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/c4-no-undef.ts)
- [Tests source](../../tests/rules/c4-no-undef.test.ts)

<!-- end auto-generated rule resources -->
