---
"prettier-plugin-mmd": patch
---

Keep a `participant` or `actor` of a `sequenceDiagram` as written where
mermaid.js 10.9.8 and 11.7.0 read its data block as a part of the name:
`participant A@{x}` no longer becomes `participant A@{ x }`.
