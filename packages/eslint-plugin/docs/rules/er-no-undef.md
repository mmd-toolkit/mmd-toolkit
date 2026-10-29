# @mmd-toolkit/er-no-undef

Japanese version: [er-no-undef.ja.md](./er-no-undef.ja.md)

Disallow a `style` or `class` statement that names no entity and no subgraph.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`style` and `class` name entities or subgraphs. When the name is that of none of
them, mermaid.js accepts the statement and does nothing with it. A misspelled
name gives no error.

## Rule Details

This rule applies to entity relationship diagrams (`erDiagram`). It reports each
name in `style` or `class` that is neither an entity name nor a subgraph id
anywhere in the diagram. Entities named in relationships or in any subgraph
count as defined.

An alias does not count as a name: `style Person fill:red` after `p[Person]` is
reported. Quotes around an entity name do not change it, so `style A` can name
`"A"`. A statement before the entity or subgraph that it names is not reported,
although mermaid.js does nothing with it there: it names an entity or subgraph
of the diagram correctly.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/er-no-undef: error
erDiagram
  A
  style Z fill:red
```

```mmd
%% eslint @mmd-toolkit/er-no-undef: error
erDiagram
  p[Person]
  style Person fill:red
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/er-no-undef: error
erDiagram
  A
  style A fill:red
  class A c
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-undef](./flowchart-no-undef.md)
- [class-no-undef](./class-no-undef.md)
- [state-no-undef](./state-no-undef.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/er-no-undef.ts)
- [Tests source](../../tests/rules/er-no-undef.test.ts)

<!-- end auto-generated rule resources -->
