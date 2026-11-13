---
"prettier-plugin-mmd": minor
---

Print the `TB` in the header of a flowchart as `TD`: `flowchart TB` becomes
`flowchart TD`, `graph TB` becomes `graph TD`, and `flowchart-elk TB` becomes
`flowchart-elk TD`. Until now, since 0.6.0, the direction stayed as written, and
it still does for a flowchart with a subgraph that no link joins to the outside,
which some versions of mermaid.js draw differently with `TB` than with `TD`.
