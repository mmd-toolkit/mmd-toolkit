---
"prettier-plugin-mmd": patch
---

Print the whitespace, such as a U+00A0, before the last directive of a `title`,
`accTitle:`, or `accDescr:` line as one space in `pie`, `radar`, `packet`,
`architecture`, `gitGraph`, `cynefin`, `treemap`, `wardley`, `treeView`, `info`,
and `railroad` diagrams, and of an `accTitle:` or `accDescr:` line in `usecase`
diagrams: `title T`, U+00A0, `%%{x}%%`, and a space is now printed
`title T %%{x}%%`, not with the U+00A0 kept.
