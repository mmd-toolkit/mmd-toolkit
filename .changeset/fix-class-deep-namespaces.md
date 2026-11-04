---
"@mmd-toolkit/parser": patch
---

Parse `class` diagrams with deeply nested namespaces. `parse()` threw a
`RangeError` on `namespace` bodies nested thousands deep, which mermaid.js
accepts.
