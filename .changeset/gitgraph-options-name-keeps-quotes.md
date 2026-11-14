---
"prettier-plugin-mmd": patch
---

Keep the quotes of a `gitGraph` branch named `options`: `branch "options"` was
printed `branch options`, which mermaid.js 10.9.8 rejects.
