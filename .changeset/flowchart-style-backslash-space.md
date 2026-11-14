---
"prettier-plugin-mmd": patch
---

Keep the whitespace after a backslash that ends a style of a `style` in
`flowchart`: `style A stroke-width:3px\ ,stroke:#0f0` was printed with the space
dropped, which mermaid.js 10.9.8 draws with another style.
