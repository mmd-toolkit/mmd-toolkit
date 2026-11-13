---
"prettier-plugin-mmd": patch
---

Keep the case of `direction`, its value, `subgraph`, and `end` in an
`erDiagram`: `SUBGRAPH S` with `END` was printed `subgraph S` with `end`, which
mermaid.js 10.9.8 and 11.7.0 draw differently because they read them as
entities.
