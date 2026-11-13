---
"prettier-plugin-mmd": patch
---

Keep the lines of a `%%` comment together where a directive between them holds a
line separator (U+2028 or U+2029): the separator inside the directive was read
as the end of a comment line. In a `sequenceDiagram` with the four lines
`# native`, a U+2028, `%% first`; `%% middle`; `%%{x:`, a U+2028, `}%%%% last`;
and `remainder`, the first line came out as two lines, which mermaid.js rejects.
