---
"prettier-plugin-mmd": patch
---

Fix a space put between a data block and the edge id after it in flowchart,
swimlane, and agentflow diagrams: `A@{ shape: circle }e1@--> B` was printed
`A@{ shape: circle } e1@--> B` since 0.4.0, which mermaid.js 11.7.0 to 12.0.0
reject (an agentflow diagram, in every version that has it).
