---
"prettier-plugin-mmd": patch
---

Keep an `erDiagram` keyword that touches a `-` as written, also with a directive
between them: `class-A a`, `subgraph-x`, and `end-x` were printed `class -A a`,
`subgraph -x`, and `end` with `-x` on the next line, which mermaid.js 10.9.8
rejects or reads as other entities than 11.7.0 draws for the written text.
`class%%{init: {}}%%-A a` is kept as it is.
