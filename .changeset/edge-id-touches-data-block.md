---
"prettier-plugin-mmd": patch
---

Fix a space put between a data block and the edge id after it in flowchart,
swimlane, and agentflow diagrams: `A@{ shape: circle }e1@--> B` was printed
`A@{ shape: circle } e1@--> B`, which mermaid.js 11.5.0 to 12.2.0 reject. The
same space was put before a directive or an ignored `;` between them, which an
agentflow diagram rejects in every version.
