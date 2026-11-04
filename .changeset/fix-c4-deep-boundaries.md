---
"@mmd-toolkit/parser": patch
---

Parse `c4` diagrams with deeply nested boundaries. `parse()` threw a
`RangeError` on boundaries nested thousands deep, which mermaid.js accepts.
