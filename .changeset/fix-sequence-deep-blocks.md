---
"@mmd-toolkit/parser": patch
---

Parse `sequence` diagrams with deeply nested blocks. `parse()` threw a
`RangeError` on `loop`, `alt`, and the other blocks nested thousands deep, which
mermaid.js accepts.
