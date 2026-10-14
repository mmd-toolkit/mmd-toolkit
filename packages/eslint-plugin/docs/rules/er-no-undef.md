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

This rule reports a name in a `style` or `class` statement that is the name of
no entity and the id of no subgraph of the diagram. It applies to `er`.

The entities of a diagram are those that an entity statement or a relationship
names, anywhere in the diagram and in any subgraph. After `A`,
`style Z fill:red` and `class Z c` change nothing. Each name of a list is
checked: `style Z,A fill:red` styles `A`, and `Z` is reported. An alias is no
name: after `p[Person]`, `style Person fill:red` changes nothing and is
reported. An entity written in quotes, as `"A"`, is named by `style A`.

A statement written before the entity or the subgraph that it names changes
nothing in mermaid.js either: `style A fill:red` before `A` gives `A` no style.
Such a statement names an entity of the diagram, which is written correctly, and
the rule does not report it.

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
