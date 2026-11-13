---
"prettier-plugin-mmd": patch
---

Fix an error that stopped the formatting of a `timeline` or `journey` in which a
line ends with a `;` that mermaid.js ignores and its text goes on in the next
line: `accDescr {style:#x} A:;` followed by `e` is now printed
`accDescr {style:#x} A :; e`.
