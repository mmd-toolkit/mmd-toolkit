---
"prettier-plugin-mmd": minor
---

Print the hexadecimal colors of styles in lower case in every diagram type that
has them: `style A fill:#F9F` becomes `style A fill: #f9f`, as Prettier prints
the colors of CSS. A text that is not certainly a color, such as `url(#ABC)`,
keeps its case.
