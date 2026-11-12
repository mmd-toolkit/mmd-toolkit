---
"prettier-plugin-mmd": minor
---

Print the arrows of block diagrams and the arrow of a quadrant chart axis in
their shortest form: `A ---> B` is now printed `A --> B`, and `x-axis L ---> R`
is printed `x-axis L --> R`. The length of the line was left as written because
it is the author's choice, but it changes nothing in either diagram, and the
examples of the mermaid.js documentation write the shortest form only. An arrow
that ends in `x` or `o`, and a thick line without an end arrow, stay as written,
since older versions of mermaid.js draw them differently with another length.
