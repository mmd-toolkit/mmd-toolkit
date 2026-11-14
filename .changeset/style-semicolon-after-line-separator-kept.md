---
"prettier-plugin-mmd": patch
---

Keep the `;` that ends a `style` or `classDef` statement after a U+2028 or
U+2029 when a comment line follows it: it was dropped, and mermaid.js then read
the statement on past the comment line and took the next statement into it (`x`
in `style A fill:red`, U+2028, `;`, `%% c`, and `x` of an `erDiagram` was no
entity any more).
