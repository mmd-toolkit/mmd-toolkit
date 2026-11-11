---
"prettier-plugin-mmd": patch
---

Fix the formatter changing the tags of `Enterprise_Boundary`, `System_Boundary`,
and `Container_Boundary` in a C4 diagram: it printed a run of spaces as one
space, so `System_Boundary(s, "S", "a  b")` came out as
`System_Boundary(s, "S", "a b")`, which mermaid.js reads as other tags.
