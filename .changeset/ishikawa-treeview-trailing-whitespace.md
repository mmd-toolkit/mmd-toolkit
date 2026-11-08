---
"prettier-plugin-mmd": minor
---

Print the text of an `ishikawa` node, and the name and the description of a
`treeview` node, without the spaces and tabs at the end of the line: `R   `
becomes `R`, and `R ## note  ` becomes `R ## note`. mermaid.js trims these
texts, so the Db and the figure stay the same. The inside of a quoted name, a
description of spaces and tabs only, and the gap before a directive stay as
written.
