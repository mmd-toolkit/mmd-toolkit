---
"prettier-plugin-mmd": minor
---

Align comment lines in `treemap` and `treeview` with the next row, as in
`ishikawa`, `kanban`, and `mindmap`. They used to stay at column one. A bare
`%%` stays at column one, because mermaid.js rejects it indented.
