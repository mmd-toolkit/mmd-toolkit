---
"prettier-plugin-mmd": patch
---

Keep the runs of spaces in the tags of `Enterprise_Boundary`, `System_Boundary`,
and `Container_Boundary` in a C4 diagram, which the formatter printed as one
space and so changed the tags that mermaid.js reads:
`System_Boundary(s, "S", "a  b")` stays as written.
