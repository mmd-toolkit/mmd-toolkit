---
"prettier-plugin-mmd": minor
---

Attach a title in brackets to its name in `flowchart` and `agentflow`:
`subgraph S [t]` now prints as `subgraph S[t]`, and `flow F [T]` as `flow F[T]`,
as a node writes `A[t]`. mermaid.js reads the same diagram either way.
