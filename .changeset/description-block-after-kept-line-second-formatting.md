---
"prettier-plugin-mmd": patch
---

Fix an `erDiagram`, a `stateDiagram`, and an `xychart` description block over
several lines that starts on a line holding a `;`, with a statement after its
`}`: `A --> B; accDescr {`, `d`, and `} B --> C` of a state diagram was printed
with the block the first time and as `A --> B; accDescr: d` the second time, and
is now printed as `A --> B; accDescr: d` and `B --> C` at once.
