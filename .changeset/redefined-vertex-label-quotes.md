---
"@mmd-toolkit/eslint-plugin": patch
---

Report a vertex written again in a later `subgraph` or `flow`, which does not
get it, also when one label is in quotes and the other is not, as `A["x"]` after
`A[x]`, in `flowchart-no-redefined-vertex` and `agentflow-no-redefined-vertex`.
