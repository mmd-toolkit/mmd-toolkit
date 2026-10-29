# @mmd-toolkit/er-no-redefined-entity

Japanese version: [er-no-redefined-entity.ja.md](./er-no-redefined-entity.ja.md)

Disallow an entity statement that gives an entity a second alias.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

An entity may be written many times, and the alias written first wins. When a
name that already has an alias is written again with another alias, as for what
is meant as a new entity, mermaid.js ignores the second alias without an error.

## Rule Details

This rule applies to entity relationship diagrams (`erDiagram`). It reports an
entity statement that gives a different alias to an entity that already has one.
The statement is reported also when it adds classes or attributes, which
mermaid.js still applies; only its alias is ignored.

An alias for an entity that has none, including one first named in a
relationship, is not reported. Repeating the same alias is not reported either,
with or without quotes. Statements inside and outside a subgraph name the same
entities.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/er-no-redefined-entity: error
erDiagram
  p[Person]
  p[Human]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/er-no-redefined-entity: error
erDiagram
  p[Person]
  p
  q
  q[Order]
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-redefined-vertex](./flowchart-no-redefined-vertex.md)
- [class-no-redefined-class](./class-no-redefined-class.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/er-no-redefined-entity.ts)
- [Tests source](../../tests/rules/er-no-redefined-entity.test.ts)

<!-- end auto-generated rule resources -->
