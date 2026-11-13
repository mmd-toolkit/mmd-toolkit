---
"prettier-plugin-mmd": patch
---

Read `white-space` and `url(` where a `;` that mermaid.js ignores splits the
word: with `classDef c white-;space:pre`, the runs of spaces in the title of a
`flowchart` subgraph are kept, and `other:u;rl(#ABC)` keeps the case of its
reference.
