# mmd/flowchart/no-undef

Japanese version: [no-undef.ja.md](./no-undef.ja.md)

Disallow a `style`, `class`, or `click` statement that names an id that the
diagram does not define.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`style`, `class`, and `click` name the vertex, the link, or the subgraph that
they apply to. When the id is that of nothing in the diagram, mermaid.js gives
no error: `style` draws a new box with that id, and `class` and `click` do
nothing. A misspelled id leaves the vertex that was meant as it was.

## Rule Details

This rule reports an id in a `style`, `class`, or `click` statement that is the
id of no vertex, no subgraph, and no link of the diagram. It applies to
`flowchart-v2`, `flowchart-elk`, and `swimlane`.

After `A --> B`, `style C fill:red` adds a vertex `C` with the style `fill:red`,
`class C foo` gives no vertex the class `foo`, and `click C href "…"` makes no
vertex a link. Each id of a list is checked: `class A,C foo` gives `A` the
class, and `C` is reported.

The ids of the diagram are those of its vertices and subgraphs, and those given
to links, as `e1` in `A e1@--> B`, wherever they are written. A `style`
statement before the vertex that it names still styles it. A `class` statement
before the vertex that it names does nothing in mermaid.js, and a `click`
statement there does not make the vertex clickable, although its tooltip still
applies. Such a statement names an id of the diagram, which is written
correctly, and the rule does not report it.

A vertex that a `style` statement adds is a vertex of the diagram too, so the
rule reports only the first `style` of an id that nothing else defines. After
`style C fill:red`, a second `style C stroke:blue` adds its style to the vertex
`C`, and `class C foo` and `click C href "…"` apply to it; none of them is
reported.

`style` with the id of a link is not reported either. `style` applies to
vertices and subgraphs: written after the link, it does nothing, and written
before the link, as `style e1 stroke:red` before `A e1@--> B`, it adds a vertex
`e1` with that style, as it does for any id that names nothing yet. A link takes
a style from `linkStyle` or from a class.

Examples of **incorrect** code for this rule:

```mmd
%% eslint mmd/flowchart/no-undef: error
flowchart LR
  A --> B
  style C fill:red
```

```mmd
%% eslint mmd/flowchart/no-undef: error
flowchart LR
  classDef foo fill:#f00
  A --> B
  class C foo
```

```mmd
%% eslint mmd/flowchart/no-undef: error
flowchart LR
  A --> B
  click C href "https://example.com"
```

Examples of **correct** code for this rule:

```mmd
%% eslint mmd/flowchart/no-undef: error
flowchart LR
  style A fill:red
  A --> B
```

```mmd
%% eslint mmd/flowchart/no-undef: error
flowchart LR
  subgraph S
    A
  end
  style S fill:red
```

```mmd
%% eslint mmd/flowchart/no-undef: error
flowchart LR
  classDef foo fill:#f00
  A e1@--> B
  class e1 foo
```

```mmd
%% eslint mmd/flowchart/no-undef: error
flowchart LR
  A --> B
  click A href "https://example.com"
```

## Options

This rule has no options.

## Related Rules

- [class/no-undef](../class/no-undef.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../../src/rules/flowchart/no-undef.ts)
- [Tests source](../../../tests/rules/flowchart/no-undef.test.ts)

<!-- end auto-generated rule resources -->
