---
"prettier-plugin-mmd": minor
---

Follow mermaid.js 12.3.0. In `flowchart`, `A[ user@example.com ]` is now
formatted as `A[user@example.com]`, because `A[x@]` is accepted and reads the
same; `agentflow` still keeps the space. An edge id that starts like an arrow,
as in `A[x]--a@-->B`, stays attached to the shape before it, so that formatting
no longer turns it into link text. In `agentflow`, an edge id after a data
block, as in `A@{ shape: rect }e1@-->B`, stays attached to the block, so that
the output is no longer rejected.
