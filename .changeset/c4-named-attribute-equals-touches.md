---
"prettier-plugin-mmd": minor
---

Print the `=` of a C4 named attribute against the key and the value:
`Person(a, "A", $descr = "D")` was printed with a space on each side of the `=`,
and is now printed `Person(a, "A", $descr="D")`. The spaces were added to make
the boundary between the key and the value easier to read, but mermaid.js reads
both forms the same, and the examples of its documentation write the attribute
without them, so a diagram copied from the documentation was changed for no
reason. Now the `=` stays against the key and the value, as in the
documentation.
