---
"prettier-plugin-mmd": patch
---

Fix a `sequenceDiagram` line that ends with a `;` after a comment:
`accDescr {} A->>B: x #style:#x; ` was printed on one line and, formatted again,
on two lines, and is now printed on two lines at once. A line whose `style:#x`
stands in another statement, as in `accDescr {style:#x} A->>B: x #a;`, stays on
one line, where it was split and the message was read differently; so does such
a line of an `else`, `and`, or `option`, and of an `end`, and one whose entity
name a directive splits (`x #a%%{init: {}}%%;`).
