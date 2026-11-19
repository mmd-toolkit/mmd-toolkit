---
"prettier-plugin-mmd": patch
---

Print `title T`, U+00A0, `%%{x}%%`, and a space as `title T %%{x}%%` the first
time you format it, where the U+00A0 stayed until the second time, in the
`title`, `accTitle:`, and `accDescr:` lines of `pie`, `radar`, `packet`,
`architecture`, `gitGraph`, `cynefin`, `treemap`, `wardley`, `treeView`, `info`,
and `railroad` diagrams, and in the `accTitle:` and `accDescr:` lines of
`usecase` diagrams. The same holds before directives that touch each other, as
in `title T`, U+00A0, `%%{x}%%%%{y}%%`, and a space, and, in `usecase` diagrams,
where the whitespace is a U+2028 or U+2029.
