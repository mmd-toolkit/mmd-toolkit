---
"prettier-plugin-mmd": minor
---

Print the colon of the size of a Venn `set` or `union` with one space on each
side: `set A["Alpha"]:20` is now printed `set A["Alpha"] : 20`, and
`union A,B["AB"]:3` is printed `union A, B["AB"] : 3`. Before, the colon touched
the name or label before the size, as the documentation of mermaid.js writes it,
but the size belongs to the whole declaration, and in a `union` a colon against
the last name looked like the size of that name alone. Now the colon stands
between the declaration and its size, the way an operator between two things
does, and mermaid.js reads the same diagram.
