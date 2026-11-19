---
"prettier-plugin-mmd": patch
---

Print the whitespace before the last directive of a `title`, `accTitle:`, or
`accDescr:` line as one space in the first formatting, also where it is U+00A0
or U+3000 and spaces or tabs follow the directive, in `pie`, `radar`, `packet`,
`architecture`, `gitGraph`, `cynefin`, `treemap`, `wardley`, `treeView`, `info`,
and `railroad` diagrams, and in the `accTitle:` and `accDescr:` lines of
`usecase` diagrams. `title T`, U+00A0, `%%{x}%%`, and a space was printed with
its U+00A0 and is now printed `title T %%{x}%%`.
