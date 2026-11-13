---
"prettier-plugin-mmd": patch
---

Keep the case of `direction`, its value, `subgraph`, and `end` in an
`erDiagram`: `SUBGRAPH S` with `END` no longer becomes `subgraph S` with `end`.
Version 0.6.0 began to print these words in the case of the examples in the
documentation of mermaid.js, but mermaid.js 10.9.8 and 11.7.0 read them as the
names of entities, so the diagram that they draw changed once the text was
formatted. Now these words stay as written.
