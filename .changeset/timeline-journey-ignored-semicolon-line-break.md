---
"prettier-plugin-mmd": patch
---

Fix an error that stopped the formatting where a line ends with a `;` that
mermaid.js ignores and its statement goes on in the next line: in a `timeline`,
`accDescr {style:#x} A:;` followed by `e` is now printed
`accDescr {style:#x} A :; e`.
