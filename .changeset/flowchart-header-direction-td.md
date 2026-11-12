---
"prettier-plugin-mmd": minor
---

Print the `TB` in the header of a flowchart that has no subgraph as `TD`:
`flowchart TB` becomes `flowchart TD`, and `graph TB` becomes `graph TD`. Until
now, since 0.6.0, the direction stayed as written, because some versions of
mermaid.js draw a flowchart with a subgraph differently with `TB` than with
`TD`. Without a subgraph every version draws them the same, and a flowchart with
a subgraph keeps its header as written.
