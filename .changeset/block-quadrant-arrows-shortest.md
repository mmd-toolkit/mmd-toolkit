---
"prettier-plugin-mmd": minor
---

Print the arrows of block diagrams and the arrow of a quadrant chart axis in
their shortest form: `A ---> B` is now printed `A --> B`, `A <---x B` is printed
`A <--x B`, and `x-axis L ---> R` is printed `x-axis L --> R`. Before, the
length of the line stayed as written, because it is the author's choice, so the
same arrow came out in two forms in one diagram although mermaid.js draws them
the same. Now only the shortest form is printed, and an arrow that some versions
of mermaid.js draw differently with another length, such as `---x`, stays as
written.
