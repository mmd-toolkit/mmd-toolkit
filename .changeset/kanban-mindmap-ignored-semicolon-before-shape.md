---
"prettier-plugin-mmd": patch
---

Keep the `;` that stands between the text and the shape of a `kanban` card or a
`mindmap` node: `style:#a;b ;[x]` was printed `style:#a;b[x]`, which mermaid.js
reads with another id, and now stays as written.
