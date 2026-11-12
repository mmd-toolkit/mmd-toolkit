---
"prettier-plugin-mmd": minor
---

Print the header of a `gitGraph` without a direction without the colon:
`gitGraph:` becomes `gitGraph`. Before, since 0.6.0, the colon stayed as
written, because mermaid.js 8.14.0 reads the header only with it, so the same
diagram came out in two forms although both draw the same figure in mermaid.js
10.9 and later. Now the colon is left out, as in most examples of the
documentation of mermaid.js, and `gitGraph LR:` keeps it, since a direction
needs it, and so does `gitGraph %%{x}%%:`, which mermaid.js 10.9.8 rejects
without it.
