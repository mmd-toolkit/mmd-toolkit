---
"prettier-plugin-mmd": patch
---

Keep `accDescr {style:#x} direction LR;;` at the first column in a `flowchart`,
`swimlane-beta`, or `agentflow-beta` diagram, also inside a subgraph or a flow,
where indenting it made mermaid.js read an empty accessibility description
instead of `style:#x`.
