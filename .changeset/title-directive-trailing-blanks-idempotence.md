---
"prettier-plugin-mmd": patch
---

Print the whitespace, such as a U+00A0, before the last directive of a `title`,
`accTitle:`, or `accDescr:` line as one space in `pie`, `radar`, `packet`,
`architecture`, `gitGraph`, `cynefin`, `treemap`, `wardley`, `treeView`, `info`,
`railroad`, and `usecase` diagrams: `title T`, U+00A0, `%%{x}%%` is now printed
`title T %%{x}%%`.
