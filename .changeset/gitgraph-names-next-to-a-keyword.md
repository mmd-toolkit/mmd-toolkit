---
"prettier-plugin-mmd": minor
---

Print `branch "commit-x"` as `branch commit-x` and `branch "Title"` as
`branch Title`. Since 0.8.0, which began to print gitGraph names without quotes,
a name that started with a keyword, or spelled one in another case, kept its
quotes, because the lexer of an older version of mermaid.js compares keywords in
any case and ends them at a `-`, so the same branch came out in two forms
although every version that the formatter checks now reads both the same. Now
the quotes stay only on a name that one of those versions reads as a keyword,
such as `"Merge"`.
