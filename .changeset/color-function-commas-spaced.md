---
"prettier-plugin-mmd": minor
---

Print a space after each comma of a color function in the `rect` and `box` of a
sequence diagram and in the `style` of a Venn diagram: `rect rgb(191,223,255)`
was printed as written, and is now printed `rect rgb(191, 223, 255)`. The colors
were left as written, like the other texts of these statements, but mermaid.js
draws them the same either way, and the examples of its documentation write the
colors of a sequence diagram with the space, so the same color came out in two
forms. Now the commas of a color that every browser reads get the space, which
is the form of the examples.
