---
"prettier-plugin-mmd": patch
---

Keep the indentation of an `ishikawa` diagram as written where it does not show
the tree by nesting alone: `ishikawa`, `R`, `  A`, ` B`, `  C` (indented by 0,
2, 1, and 2) was printed with every cause one step under `R`, which mermaid.js
11.13.0 draws as another figure.
