---
"prettier-plugin-mmd": patch
---

Fix output that changed when it was formatted a second time in `agentflow-beta`,
`block-beta`, and `mindmap`, where a `;` that mermaid.js ignores ends a name or
a style: `classDef c fill:red%%{init: {}}%%;` of a `block-beta` is printed
`classDef c fill: red%%{init: {}}%%` at the first formatting.
