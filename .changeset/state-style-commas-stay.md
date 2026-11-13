---
"prettier-plugin-mmd": patch
---

Keep the commas of a `style` with one style in a `stateDiagram` as written:
`style A fill:rgb(1,2,3)` is now printed `style A fill: rgb(1,2,3)`, not
`style A fill: rgb(1, 2, 3)`. Version 0.6.0 began to print one space after these
commas, as mermaid.js 12.3.0 reads the same style either way, but mermaid.js
10.9.8 draws the text of such a line, so the text in its diagram changed once
the line was formatted. Now these commas stay as written, and a line with
several styles, such as `style A fill:red,stroke:blue`, is printed as before.
