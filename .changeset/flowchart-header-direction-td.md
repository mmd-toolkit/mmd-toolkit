---
"prettier-plugin-mmd": minor
---

Print the `TB` in the header of a `flowchart` as `TD`: `flowchart TB` becomes
`flowchart TD`. Before, since 0.6.0, the direction stayed as written, because
some versions of mermaid.js draw a flowchart with a subgraph that no link joins
to the outside differently with `TB` than with `TD`, so every other flowchart
came out in two forms that draw the same figure. Now the header is printed `TD`,
as the documentation of mermaid.js mostly writes it, and `TB` stays only for a
flowchart with such a subgraph.
