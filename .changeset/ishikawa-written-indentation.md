---
"prettier-plugin-mmd": patch
---

Keep `ishikawa` indentation needed to preserve the drawing: `ishikawa`, `R`,
`  A`, ` B`, and `  C` on successive lines now stay as written instead of
placing every cause one step under `R`, which mermaid.js 11.13.0 draws
differently.
