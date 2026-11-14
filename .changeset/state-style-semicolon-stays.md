---
"prettier-plugin-mmd": patch
---

Keep the `;` that ends a `style` of a `stateDiagram`: `style A fill:red;` no
longer becomes `style A fill: red`. Version 0.5.0 began to drop this `;`, as
mermaid.js 12.3.0 reads the line the same without it, but mermaid.js 10.9.8
reads the `;` as a state of its own, so a state disappeared from the diagram
that it draws once the text was formatted. Now the line stays as written, and
the `;` of a `classDef` is dropped as before.
