---
"prettier-plugin-mmd": patch
---

Keep the attributes of an `erDiagram` entity on one line where a later one has a
pair of `~`: `int a PK List~int~ b` was printed as `int a PK` and `List~int~ b`
on two lines, which mermaid.js 10.9.8 draws as two attributes in place of one.
