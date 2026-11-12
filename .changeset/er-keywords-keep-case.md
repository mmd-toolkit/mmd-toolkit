---
"prettier-plugin-mmd": patch
---

Keep the case of `direction`, its value, `subgraph`, and `end` in an
`erDiagram`: `DIRECTION lr` was printed `direction LR`, and `SUBGRAPH S` with
`END` was printed `subgraph S` with `end`, which mermaid.js before 11.17.2 draws
differently because it reads them as entities.
