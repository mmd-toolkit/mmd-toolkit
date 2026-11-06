---
"prettier-plugin-mmd": minor
---

Print a one-line `@{ ... }` with one space inside each end in `flowchart`,
`agentflow`, `kanban`, and `sequence`. `A@{shape: rect}` now prints as
`A@{ shape: rect }`. mermaid.js reads the same data either way. A block that
touches another block, holds a directive, or holds only whitespace stays as
written, and so do the JSON tables of `usecase`, whose braces are part of the
JSON.
