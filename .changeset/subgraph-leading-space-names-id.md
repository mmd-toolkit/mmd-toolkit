---
"prettier-plugin-mmd": patch
---

Keep the second space in `subgraph  S` of a flowchart or swimlane diagram when a
later statement such as `S --> Z` names the subgraph: it was printed
`subgraph S`, which mermaid.js 10.9.8 to 11.17.2 draw with that edge starting at
the subgraph and not at a separate node `S`.
