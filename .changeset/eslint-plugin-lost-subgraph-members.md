---
"@mmd-toolkit/eslint-plugin": minor
---

`flowchart-no-redefined-vertex` and `agentflow-no-redefined-vertex` now also
report a vertex written in a later subgraph or flow that does not get it,
because an earlier one already has it, when the statement has no link, class, or
data block and says nothing new about the vertex.
`agentflow-no-redefined-connector` reports a connector declaration in a later
flow in the same way.
