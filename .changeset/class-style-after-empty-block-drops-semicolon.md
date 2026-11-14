---
"prettier-plugin-mmd": patch
---

Fix a `style` or `classDef` line that follows `accDescr {}` in a `classDiagram`:
`accDescr {} style A fill:#f00;` was printed as
`accDescr {} style A fill: #f00;`, which mermaid.js reads differently or
rejects.
