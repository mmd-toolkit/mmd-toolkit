# mmd/flowchart/no-ignored-text

Japanese version: [no-ignored-text.ja.md](./no-ignored-text.ja.md)

Disallow text on a direction line that mermaid.js does not read.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A `direction` statement is written on a line of its own. When the line also
holds other text, mermaid.js reads the whole line as the direction statement and
drops the rest without an error.

## Rule Details

This rule reports the text that stands on a direction line before `direction` or
after the direction value. It applies to `flowchart-v2`, `flowchart-elk`, and
`swimlane`.

A link written on the same line, before or after the direction, disappears, also
when a `;` separates the two. In a subgraph, `A-->B; direction TB` and
`direction TB; A-->B` give the subgraph the direction `TB` and make no vertex
and no link, while the same two statements on two lines make the link from `A`
to `B`. At the top level, `A-->B direction TB` makes no vertex and no link
either. Text after the direction, as in `direction LR trailing`, is dropped in
the same way.

A line becomes a direction statement also when it is not meant as one. When
`direction` and a direction value stand on it, as in `A[Set direction LR]-->B`,
the line is a direction statement and makes no vertex and no link. The rule
reports that too.

Text after the direction that starts with `%%`, as in
`direction TB %% vertical`, is not reported. The author means it as a comment,
and mermaid.js drops it, as the author intended.

Examples of **incorrect** code for this rule:

```mmd
flowchart LR
  subgraph S
    A-->B; direction TB
  end
```

```mmd
flowchart LR
  A-->B direction TB
```

```mmd
flowchart LR
  subgraph S
    direction TB; A-->B
  end
```

Examples of **correct** code for this rule:

```mmd
flowchart LR
  subgraph S
    A --> B
    direction TB
  end
```

```mmd
flowchart LR
  subgraph S
    direction TB %% vertical
    A --> B
  end
```

## Options

This rule has no options.
