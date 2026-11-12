---
"prettier-plugin-mmd": patch
---

Fix `flowchart` subgraph names that hold `_self`, `_blank`, `_parent`, or `_top`
losing their quotes: `subgraph "x_self"` was printed `subgraph x_self`, which
mermaid.js before 10.3.1 rejects.
