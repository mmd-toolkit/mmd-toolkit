---
"prettier-plugin-mmd": patch
---

Keep a `direction` text after an empty `accTitle:` from becoming a direction
statement in `classDiagram`, `stateDiagram`, `erDiagram`, and
`requirementDiagram`: `  accTitle:` followed by `    direction LR` in an
`erDiagram` was printed `  accTitle: direction LR`, which mermaid.js reads as a
direction and not as the title, and is now printed `accTitle: direction LR` at
the start of its line.
