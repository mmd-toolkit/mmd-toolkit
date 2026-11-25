---
"prettier-plugin-mmd": patch
---

Print a comment or a directive that follows a quote, a class, or an icon in a
`treeView` box diagram touching it where the next node is given a branch:
`"a" %% c`, `─`, and `"b"` printed `"a" %% c`, `│`, and `└── "b"`, which
mermaid.js rejects, and now print `"a"%% c`, `│`, and `└── "b"`.
