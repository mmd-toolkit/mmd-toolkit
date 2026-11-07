---
"prettier-plugin-mmd": minor
---

Print the text of a `mindmap` node, the text of its shape, its icon, and its
class without the spaces and tabs at their ends: `a (x)` becomes `a(x)`,
`b[ y ]` becomes `b[y]`, and `::icon( fa )` becomes `::icon(fa)`. mermaid.js
draws the same node. A string, a text that would start a string without its
padding, and a text over lines stay as written.
