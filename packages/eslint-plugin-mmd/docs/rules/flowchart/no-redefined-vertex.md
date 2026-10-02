# mmd/flowchart/no-redefined-vertex

Japanese version: [no-redefined-vertex.ja.md](./no-redefined-vertex.ja.md)

Disallow writing the shape or the label of a vertex again, differently.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A vertex may be written many times, and the shape and the label written last
win. When an id that is already in use is written again for what is meant as a
new vertex, the earlier shape or label is lost without an error.

## Rule Details

This rule reports a vertex written with a shape when the same vertex was written
before with a different shape or a different label. It applies to
`flowchart-v2`, `flowchart-elk`, and `swimlane`.

After `A[Start] --> B`, the line `C --> A[End]` gives the vertex `A` the label
`End`, and the label `Start` is lost. Writing the vertex again without a shape,
as in `A --> C`, keeps its shape and label and is not reported, and neither is
writing the same shape and label again.

Examples of **incorrect** code for this rule:

```mmd
flowchart LR
  A[Start] --> B
  C --> A[End]
```

Examples of **correct** code for this rule:

```mmd
flowchart LR
  A[Start] --> B
  A --> C
```

```mmd
flowchart LR
  A[Start] --> B
  C --> A[Start]
```

## Options

This rule has no options.
