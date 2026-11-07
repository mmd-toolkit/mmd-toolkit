---
"prettier-plugin-mmd": minor
---

Attach a title to its name in `flowchart`, `agentflow`, `er`, and `usecase`:
`subgraph S [t]` now prints as `subgraph S[t]`, `flow F [T]` as `flow F[T]`, and
`systemBoundary S (t)` as `systemBoundary S(t)`, as a node writes `A[t]`.
mermaid.js reads the same diagram either way.
