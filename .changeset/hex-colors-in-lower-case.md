---
"prettier-plugin-mmd": minor
---

Print the hexadecimal colors of styles in lower case: `style A fill:#F9F`
becomes `style A fill: #f9f`, as Prettier prints the colors of CSS. The colors
of a `classDef` in `classDiagram` keep their case, because mermaid.js 10.9.8
draws that line as text.
