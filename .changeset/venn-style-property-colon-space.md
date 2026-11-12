---
"prettier-plugin-mmd": minor
---

Print the properties of a Venn `style` statement as `key: value`:
`style A fill:#f00` was printed as written, and is now printed
`style A fill: #f00`. Both spellings were left as written, following the
examples of the mermaid.js documentation that write `fill:#ff6b6b`, so the same
property could be printed in two forms. Now a property is printed with the space
after its colon, which mermaid.js reads the same.
