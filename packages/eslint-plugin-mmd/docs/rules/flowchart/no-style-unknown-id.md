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

## Implementation Notes

The rule is not implemented yet. These notes are for implementing it.

### How the tree shows it

A `FlowchartStyleStatement` whose `id` has a `name` that the `id` of no
`FlowchartVertex` of the diagram has, before or after the statement, and that is
not the id of a subgraph.

The id of a subgraph is the difficulty. It is not a field of the tree:
mermaid.js derives it from the name, the title, and the source text after the
name, and generates ids such as `subGraph0` (see Db normalization in the
specification's diagrams/flowchart.md). The rule would have to repeat that
derivation, which the normalizer of `@mmd-toolkit/tests` also performs. Whether
the parser should offer the id of a subgraph is an open question.

### Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `flowchart/db-style-unknown-vertex`
- `flowchart/db-style-before-vertex`
- `flowchart/db-style-subgraph-id`
