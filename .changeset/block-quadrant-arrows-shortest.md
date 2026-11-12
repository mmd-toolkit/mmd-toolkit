---
"prettier-plugin-mmd": minor
---

Print the arrows of block diagrams and the arrow of a quadrant chart axis in
their shortest form: `A ---> B` is now printed `A --> B`, `A <---x B` is printed
`A <--x B`, and `x-axis L ---> R` is printed `x-axis L --> R`. An arrow without
a `<` that ends in `x` or `o`, and a thick line that does not end in `>`, stay
as written, since some of the versions of mermaid.js that the formatter checks
draw them differently with another length.
