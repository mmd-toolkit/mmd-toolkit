---
"@mmd-toolkit/parser": patch
---

Parse `state` diagrams with deeply nested composite states. `parse()` threw a
`RangeError` on bodies nested more than a thousand deep, which mermaid.js
accepts.
