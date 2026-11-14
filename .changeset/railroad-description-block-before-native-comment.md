---
"prettier-plugin-mmd": patch
---

Keep the `accDescr { ... }` block of a railroad diagram as a block where a
comment of that diagram type follows it on its line: `accDescr { d } ; c` in
`railroad-abnf-beta` was printed `accDescr: d ; c`, which made the comment part
of the description.
