---
"prettier-plugin-mmd": minor
---

Print the hexadecimal colors of styles in lower case: `style A fill:#F9F`
becomes `style A fill: #f9f`, as Prettier prints the colors of CSS. A text that
is not certainly a color, such as `url(#ABC)`, keeps its case, and so does a
`classDef` of `classDiagram`.
