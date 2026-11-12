---
"prettier-plugin-mmd": patch
---

Fix `erDiagram` names that start with `_` losing their quotes:
`"_x" ||--o{ ORDER : has` was printed `_x ||--o{ ORDER : has`, which mermaid.js
before 10.5.0 rejects.
