---
"prettier-plugin-mmd": patch
---

Keep the whitespace beside the `()` of a `sequenceDiagram` message and before
`<<->>` and `<<-->>` as written: `A () ->> () B` was printed `A() ->> ()B`, and
`A<<->>B` was printed `A <<->> B`, which mermaid.js 10.9.8, 11.7.0, and 11.8.1
(for `()`) and 10.9.8 (for the two arrows) draw with other names, since they
read the `()` or the `<<` as part of a name.
