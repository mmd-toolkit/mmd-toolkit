---
"prettier-plugin-mmd": patch
---

Read `white-space` where a `;` that mermaid.js ignores splits the word: with
`classDef c fill:#fff,white-;space:pre`, the title `Title  text` of a
`flowchart` subgraph was printed `Title text`, and now keeps its two spaces.
