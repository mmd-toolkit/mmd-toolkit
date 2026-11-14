---
"@mmd-toolkit/parser": patch
---

Read a name in `erDiagram`, and the name of a class of `classDef` in
`quadrantChart`, across a comment line that follows a U+2028 or a U+2029 in it,
as one name, which threw an internal error.
