---
"prettier-plugin-mmd": patch
---

Print a `requirement` statement that a comment line after U+2028 or U+2029 cuts
as written to its end, so that mermaid.js accepts the formatted text:
`element\u2028%% c`, an empty line, `"e"`, and `:::c {` on the next line no
longer print `e:::c {`.
