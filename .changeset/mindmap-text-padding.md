---
"prettier-plugin-mmd": minor
---

Print the text of a `mindmap` node, the text of its shape, its icon, and its
class without the spaces and tabs at their ends: `a (x)` becomes `a(x)`,
`b[ y ]` becomes `b[y]`, and `::icon( fa )` becomes `::icon(fa)`. The same holds
for the cards, labels, icons and classes of a `kanban` board, but not for the id
of a column, which mermaid.js tells apart from another by its text. mermaid.js
draws the same node. An icon, a class, or a shape text of spaces and tabs only
becomes one space, since the grammar rejects an empty one. A string, a text that
would start a string without its padding, and a text over lines stay as written.
