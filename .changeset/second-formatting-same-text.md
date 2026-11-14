---
"prettier-plugin-mmd": patch
---

Fix output that changed when it was formatted a second time in `agentflow-beta`,
`block-beta`, `mindmap`, and `treemap`, where a `;` ends a name or a style
beside text that mermaid.js removes: `classDef c fill:red%%{init: {}}%%;` of a
`block-beta` is printed `classDef c fill: red%%{init: {}}%%` at the first
formatting.
