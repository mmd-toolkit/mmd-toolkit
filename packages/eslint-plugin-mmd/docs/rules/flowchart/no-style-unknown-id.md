# mmd/flowchart/no-style-unknown-id

Japanese version: [no-style-unknown-id.ja.md](./no-style-unknown-id.ja.md)

Disallow a `style` statement whose id names no vertex and no subgraph.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A `style` statement makes the vertex that it names when there is none, so a
misspelled id draws a new box instead of styling the box that was meant.

## Rule Details

This rule reports a `style` statement whose id is the id of no vertex and of no
subgraph of the diagram. It applies to `flowchart-v2`, `flowchart-elk`, and
`swimlane`.

After `A --> B`, `style C fill:red` adds a vertex `C` with the style `fill:red`.
Where the statement stands does not matter: `style A fill:red` before `A --> B`
styles `A`. The id of a subgraph is not reported, because `style` is also how a
subgraph is coloured.

Examples of **incorrect** code for this rule:

```mmd
flowchart LR
  A --> B
  style C fill:red
```

Examples of **correct** code for this rule:

```mmd
flowchart LR
  style A fill:red
  A --> B
```

```mmd
flowchart LR
  subgraph S
    A
  end
  style S fill:red
```

## Options

This rule has no options.
