---
"prettier-plugin-mmd": patch
---

Print a description block over several lines that starts on a line holding a `;`
in the form with the colon at the first formatting, in every diagram type:
`A --> B; accDescr {`, `d`, and `} B --> C` of a `stateDiagram` was printed with
the block the first time and as `A --> B; accDescr: d` the second time, and is
now printed as `A --> B; accDescr: d` and `B --> C` at once. A block whose text
holds a `;` that the form with the colon would make mermaid.js read otherwise
stays as written.
