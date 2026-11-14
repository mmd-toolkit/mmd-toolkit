---
"prettier-plugin-mmd": patch
---

Keep a `flowchart` or `erDiagram` line as written, with its indentation, where
mermaid.js reads `direction` and a direction value in it only after it removes a
`;` or a comment line: `accTitle:style:#x,direc;tion TB` and an `accTitle:` of
`direction` with `TB` after a comment line were indented, which turned them into
direction statements and dropped the title.
