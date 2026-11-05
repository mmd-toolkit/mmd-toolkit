---
"@mmd-toolkit/spec": minor
---

Follow mermaid.js 12.3.0. In flowchart, an edge id now stops at `[`, `]`, `(`,
`)`, `{`, `}`, and `|`, so `A[x@]` and `A-->|x@|B` are accepted, and whitespace
may follow a data block at the end of a statement. Agentflow keeps its earlier
rules for both.
