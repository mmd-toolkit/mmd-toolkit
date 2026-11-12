---
"prettier-plugin-mmd": minor
---

Print the commas of a Venn name list without a space after them: `union A , B`
was printed `union A, B`, and is now printed `union A,B`. The space was added
for readability, but the examples of the mermaid.js documentation write every
such list as `A,B`, and the other diagram types print their lists of names the
same way. The commas between the properties of a `style` statement keep their
space.
