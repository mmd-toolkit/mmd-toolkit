---
"prettier-plugin-mmd": minor
---

Print the styles of a usecase `classDef` and `style` with no space before the
first `:` and one space after it, as in the other diagram types:
`style A fill   :  red` becomes `style A fill: red`. A name that ends with
`stroke` keeps a space before the `:` if one was written
(`classDef c stroke :#d33` becomes `classDef c stroke : #d33`), since mermaid.js
colours the arrowheads of a relationship from `stroke:` only.
