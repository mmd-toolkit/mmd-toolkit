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

This rule reports an entity statement with an alias when an earlier entity
statement gave the same entity a different alias. It applies to `er`.

After `p[Person]`, the statement `p[Human]` leaves the entity `p` with the alias
`Person`. Only the alias is ignored: the classes and the attributes of the later
statement apply. An alias given to an entity that has none yet is set: after
`p`, or after a relationship that names `p`, `p[Human]` gives `p` the alias
`Human`, and it is not reported. Neither is writing the same alias again, also
once in quotes and once without, as `p["Person"]` and `p[Person]`. Statements
inside a subgraph and outside it name the same entities.

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
