---
"prettier-plugin-mmd": patch
---

Print an ER `style` or `classDef` that ends in a U+2028 or U+2029 as
`style A fill: red`, with or without a `;` after it and whatever follows it.
Before, the line stayed as written (`style A fill:red` and the character), as
0.5.0 began to print it, because mermaid.js stores the character in the text of
the style, so the same style came out in two forms depending on a character that
cannot be seen, although mermaid.js draws the same figure without it. Now the
character goes, with the `;` where there is one, and stays only where dropping
it would change what mermaid.js reads, such as before a comment line and a
statement.
