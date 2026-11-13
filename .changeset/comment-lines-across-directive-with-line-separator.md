---
"prettier-plugin-mmd": patch
---

Keep the lines of a `%%` comment together where a directive between them holds a
line separator (U+2028 or U+2029): the separator inside the directive was read
as the end of a comment line, so `# native`, a U+2028, and `%% first` on one
line of a `sequenceDiagram` came out on two lines, which mermaid.js rejected.
