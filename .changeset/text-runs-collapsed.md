---
"prettier-plugin-mmd": minor
---

Print a run of spaces and tabs inside a title, an accessibility text, and the
labels that mermaid.js draws as SVG text as one space: `title Sales   report`
becomes `title Sales report`, and `quadrant-1 a    b` becomes `quadrant-1 a b`.
mermaid.js draws both the same. The labels that it draws as HTML (the nodes and
edges of a `flowchart`, the descriptions of a `stateDiagram`, the nodes of a
`mindmap`, and the texts of a `usecase`) keep their runs, since a label that
wraps draws them, and so do a markdown title of a subgraph, a text with a `<`, a
text of spaces and tabs only that is not a string, the names that other
statements refer to, and every text of a diagram that holds `white-space`. The
label, the technology, the type, and the description of a C4 statement are texts
of the first kind.
