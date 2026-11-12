---
"prettier-plugin-mmd": minor
---

Print the properties of a Venn `style` statement as `key: value`:
`style A fill:#f00` was printed as written, and is now printed
`style A fill: #f00`. The properties kept the compact form of the mermaid.js
examples, unlike the styles of every other diagram type, which have a space
after the colon. A line with a `;` that the printer keeps stays as written after
the colon, since mermaid.js reads the gap there.
