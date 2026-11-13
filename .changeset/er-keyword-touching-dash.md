---
"prettier-plugin-mmd": patch
---

Keep an `erDiagram` keyword that touches a `-` as written: `class-A a` was
printed `class -A a`, which mermaid.js 10.9.8 rejects.
