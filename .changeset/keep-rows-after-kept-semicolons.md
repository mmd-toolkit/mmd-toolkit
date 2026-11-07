---
"prettier-plugin-mmd": patch
---

Fix output that mermaid.js rejected in `treemap` and `treeview`. Where a `;`
stays and whitespace follows it, as in `classDef zz a:b; %% c`, that whitespace
indents the next row, and it was printed together with the indentation of the
row, which mermaid.js reads as a second indentation. It now moves to the row
once, so the comment or directive touches the `;`.
