---
"prettier-plugin-mmd": minor
---

Print the commas of a Venn name list without a space after them: `union A , B`
was printed `union A, B`, and is now printed `union A,B`. The space was added to
make a list easier to read, but mermaid.js reads a list the same with or without
it, and the lists of names in the mermaid.js documentation have none. Now the
commas touch the names on both sides, the form the examples of the documentation
use, and the commas between the properties of a `style` statement keep their
space.
