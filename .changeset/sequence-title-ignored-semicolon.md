---
"prettier-plugin-mmd": patch
---

Keep a line together where a `;` that mermaid.js ignores stands between a
statement and its value on the next line: in a `sequenceDiagram`,
`participant A@{"style":"x:#y"};title;` followed by `T` was split into two
lines that mermaid.js rejects, and is now printed
`participant A@{"style":"x:#y"};title; T`.
