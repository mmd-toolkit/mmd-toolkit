---
"prettier-plugin-mmd": minor
---

Print the header of a `gitGraph` without a direction without the colon:
`gitGraph:` becomes `gitGraph`. Before, since 0.6.0, the colon stayed as
written, because an older version of mermaid.js reads the header only with it,
so the same diagram came out in two forms although both draw the same figure in
every version that the formatter checks. Now the colon is left out, as in most
examples of the documentation of mermaid.js, and a header followed by a
directive, such as `gitGraph %%{x}%%:`, keeps it, since mermaid.js 10.9.8
rejects that header without it.
