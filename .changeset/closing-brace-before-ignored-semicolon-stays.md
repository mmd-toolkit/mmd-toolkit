---
"prettier-plugin-mmd": patch
---

Keep the closing `}` of a `classDiagram`, `erDiagram`, or `stateDiagram` block
on its line where a `;` that mermaid.js ignores follows it:
`class Alpha { +style:#x };` was printed with `};` on a line of its own, which
mermaid.js rejects.
