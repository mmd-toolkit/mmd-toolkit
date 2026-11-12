---
"prettier-plugin-mmd": patch
---

Keep an `erDiagram` keyword that touches a `-` as written: `class-A a`,
`subgraph-x`, and `end-x` were printed `class -A a`, `subgraph -x`, and `end`
with `-x` on the next line, which mermaid.js 10.9.8 rejects or reads as other
entities than 11.7.0 to 11.16.1 draw for the written text.
