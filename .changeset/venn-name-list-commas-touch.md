---
"prettier-plugin-mmd": minor
---

Print the commas of a Venn name list without a space after them: `union A , B`
was printed `union A, B`, and is now printed `union A,B`. The space was added to
make a list easier to read, but mermaid.js reads a list the same with or without
it, and none of the 18 commas in the lists of names in the mermaid.js
documentation has one. Now the commas touch the names on both sides, the form
every example of the documentation uses, and the commas between the properties
of a `style` statement keep their space.
