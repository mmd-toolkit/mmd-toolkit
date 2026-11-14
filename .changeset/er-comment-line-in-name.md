---
"@mmd-toolkit/parser": patch
---

Fix `parse()` throwing an internal error
(`mmd-toolkit parser bug: the comment region … cuts the Identifier token`) on an
`erDiagram` or a `quadrantChart` where a comment line follows a U+2028 or U+2029
inside a name. Such a name now goes on after the comment line, as mermaid.js
reads it.
