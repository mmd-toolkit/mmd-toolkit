---
"prettier-plugin-mmd": patch
---

Print an ER `style` or `classDef` that ends in a U+2028 or U+2029 and a `;` as
`style A fill: red`, whatever follows it. Before, the line stayed as written
(`style A fill:red` and the character), which 0.5.0 began to print, so the same
style came out in two forms depending on a character that cannot be seen,
although mermaid.js draws the same figure without it. Now the character goes
with the `;`, as a space or a tab does, and stays only where other whitespace,
such as a no-break space, follows it.
