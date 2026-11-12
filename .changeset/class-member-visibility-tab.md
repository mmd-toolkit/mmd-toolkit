---
"prettier-plugin-mmd": patch
---

Keep a tab after the visibility mark of an attribute of a `classDiagram`:
`+<tab>int x` was printed `+int x`, which mermaid.js 10.9.8 draws with another
name, since it reads the tab as part of the name. A tab after the mark of a
method is still dropped, since every version of mermaid.js that the formatter
checks ignores it.
