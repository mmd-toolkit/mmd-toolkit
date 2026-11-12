---
"prettier-plugin-mmd": patch
---

Fix an edge id getting a space after a data block, or after a directive that
follows one, in flowchart, swimlane, and agentflow diagrams:
`A@{ shape: circle }e1@--> B` was printed `A@{ shape: circle } e1@--> B`, which
mermaid.js 11.12.3 to 12.0.0 reject.
