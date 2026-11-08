---
"prettier-plugin-mmd": minor
---

Print the text of an `ishikawa` node, and the name and the description of a
`treeview` node, without the spaces and tabs at the end of the line: `R   `
becomes `R`, and `R ## note  ` becomes `R ## note`. mermaid.js trims these texts
and draws the same figure. The inside of a quoted name and a description of
spaces and tabs only stay as written.
