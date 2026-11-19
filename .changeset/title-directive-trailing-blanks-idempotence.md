---
"prettier-plugin-mmd": patch
---

Print `title T`, U+00A0, `%%{x}%%`, and a space as `title T %%{x}%%` the first
time you format it, where the U+00A0 stayed until the second time, in the
`title`, `accTitle:`, and `accDescr:` lines of `pie`, `radar`, `packet`,
`architecture`, `gitGraph`, `cynefin`, `treemap`, `wardley`, `treeView`, `info`,
and `railroad` diagrams, and in the `accTitle:` and `accDescr:` lines of
`usecase` diagrams.
