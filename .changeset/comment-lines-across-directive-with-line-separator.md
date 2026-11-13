---
"prettier-plugin-mmd": patch
---

Keep the lines of a `%%` comment together where a directive between them holds a
line separator (U+2028 or U+2029): the separator inside the directive was read
as the end of a comment line, so in a `sequenceDiagram` the line `# native`, a
U+2028, and `%% first`, above the lines `%% middle` and `%%{x:`, a U+2028, and
`}%%%% last`, came out on two lines, which mermaid.js rejected.
