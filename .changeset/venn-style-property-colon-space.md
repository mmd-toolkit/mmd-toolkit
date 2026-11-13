---
"prettier-plugin-mmd": minor
---

Print the properties of a `venn-beta` `style` statement as `key: value`:
`style A fill:#f00` was printed as written, and is now printed
`style A fill: #f00`. Both spellings were left as written to follow the examples
of the mermaid.js documentation, so the same property could be printed in two
forms. Now a property is printed with the space after its colon, which
mermaid.js reads the same.
