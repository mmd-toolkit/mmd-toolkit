---
"prettier-plugin-mmd": minor
---

Print spaces after commas in color functions in the `rect` and `box` of a
`sequenceDiagram` and the `style` of a `venn-beta`: `rect rgb(191,223,255)`
becomes `rect rgb(191, 223, 255)`. The colors were left as written, like the
other texts of these statements, but mermaid.js draws them the same either way,
and the examples of its documentation write the colors of a `sequenceDiagram`
with the space, so the same color came out in two forms. Now these colors have a
space after each comma, giving each color one form.
