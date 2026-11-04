---
"@mmd-toolkit/parser": patch
---

Parse `block` diagrams with deeply nested composites. `parse()` threw a
`RangeError` on composites nested thousands deep, which mermaid.js accepts.
