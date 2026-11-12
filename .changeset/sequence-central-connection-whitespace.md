---
"prettier-plugin-mmd": patch
---

Keep the whitespace beside the `()` of a `sequenceDiagram` message as written:
`A () ->> () B` was printed `A() ->> ()B`, which mermaid.js 10.9.8, 11.7.0, and
11.8.1 draw with other names, since they read the `()` as part of a name.
