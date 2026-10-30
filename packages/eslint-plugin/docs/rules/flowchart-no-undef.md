# @mmd-toolkit/flowchart-no-undef

Japanese version: [flowchart-no-undef.ja.md](./flowchart-no-undef.ja.md)

Disallow a `style`, `class`, or `click` statement that names an id that the
diagram does not define.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`style`, `class`, and `click` name the vertex, link, or subgraph they apply to.
mermaid.js does not report an unknown id: `style` draws a new box with that id,
and `class` and `click` do nothing. A misspelled id leaves the vertex you meant
as it was.

## Rule Details

This rule applies to flowcharts (`flowchart`, `graph`, `flowchart-elk`, and
`swimlane-beta`). It reports an id in a `style`, `class`, or `click` statement
that no vertex, subgraph, or link of the diagram has. Each id of a list is
checked: in `class A,C foo`, `C` is reported.

The ids that mermaid.js gives to unnamed links, such as `L_A_B_0`, count as
defined. A statement before the vertex that it names is not reported, although a
`class` there does nothing and a `click` there does not make the vertex
clickable. Once a `style` has created a vertex for an undefined id, a later
`style`, `class`, or `click` of that id is not reported: after
`style C fill:red`, `class C foo` gives `C` the class.

`style` with the id of a link is not reported either, although it does not style
the link: after the link, it does nothing, and before it, it adds a vertex of
that id.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  A --> B
  style C fill:red
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  classDef foo fill:#f00
  A --> B
  class C foo
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  A --> B
  click C href "https://example.com"
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  style A fill:red
  A --> B
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  subgraph S
    A
  end
  style S fill:red
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  classDef foo fill:#f00
  A e1@--> B
  class e1 foo
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  A --> B
  click A href "https://example.com"
```

## Options

This rule has no options.

## Related Rules

- [class-no-undef](./class-no-undef.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/flowchart-no-undef.ts)
- [Tests source](../../tests/rules/flowchart-no-undef.test.ts)

<!-- end auto-generated rule resources -->
