---
"prettier-plugin-mmd": patch
---

Keep the `;` that mermaid.js ignores between the text and the shape of a
`kanban` card or column, and of a `mindmap` node whose line holds another `;`:
`style:#a;b ;[x]` was printed `style:#a;b[x]`, which mermaid.js reads with
another id. 0.6.0 began to leave that `;` out with the whitespace around it,
since mermaid.js removes it and reads the same text, but without it mermaid.js
can take an earlier `;` of the line as the one that it removes. A `kanban` board
now keeps every such `;`, as its rules say, and a `mindmap` keeps it only where
another `;` would take its place, so that `style:#a ;[x]` is still printed
`style:#a[x]`.
