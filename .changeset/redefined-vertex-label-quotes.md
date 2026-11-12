---
"@mmd-toolkit/eslint-plugin": minor
---

Report a vertex written again in a later `subgraph` or `flow`, which does not
get it, also when one label is in quotes and the other is not, as `A["x"]` after
`A[x]`, in `flowchart-no-redefined-vertex` and `agentflow-no-redefined-vertex`.
The rules have treated the two as different since 0.3.0, so formatting with
`prettier-plugin-mmd`, which now prints a label in one of the two forms, would
have added or removed the report.
