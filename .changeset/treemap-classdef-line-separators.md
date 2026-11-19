---
"prettier-plugin-mmd": patch
---

Fix the error `a line break within a kept line` on a `title`, `accTitle`, or
`accDescr` line, and on a treemap `classDef` or a kanban column or card, that a
U+2028 or U+2029 and a comment ending in `;` follow, in a treemap, kanban,
treeview, architecture, cynefin, gitgraph, radar, info, packet, pie, wardley, or
railroad diagram: the line is now printed as written.
