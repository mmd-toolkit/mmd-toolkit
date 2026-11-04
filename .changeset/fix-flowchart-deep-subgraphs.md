---
"@mmd-toolkit/parser": patch
---

Parse `flowchart` diagrams with deeply nested subgraphs. `parse()` threw a
`RangeError` on `subgraph` bodies nested thousands deep, which mermaid.js
accepts.
