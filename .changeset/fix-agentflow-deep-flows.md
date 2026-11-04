---
"@mmd-toolkit/parser": patch
---

Parse `agentflow` diagrams with deeply nested flows. `parse()` threw a
`RangeError` on `flow` and `global` bodies nested thousands deep, which
mermaid.js accepts.
