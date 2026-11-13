---
"prettier-plugin-mmd": patch
---

Fix a space put between a data block and the edge id after it in `flowchart` and
`swimlane-beta`: `A@{ shape: circle }e1@--> B` was printed
`A@{ shape: circle } e1@--> B` since 0.4.0, which mermaid.js 11.7.0, 11.17.2,
and 12.0.0 reject in `flowchart`, and 11.16.1, 11.17.2, and 12.0.0 reject in
`swimlane-beta`.
