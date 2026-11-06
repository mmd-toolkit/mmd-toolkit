---
"prettier-plugin-mmd": minor
---

Drop the `;` at the end of `classDef` and `style` lines in `class`, `state`,
`er`, `requirement`, `block`, `venn`, and `usecase`, as in `flowchart`, when
mermaid.js reads the line the same without it. A `;` that is part of the value,
as in `style A fill:red;` in `requirement`, stays.
