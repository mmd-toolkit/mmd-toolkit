---
"prettier-plugin-mmd": patch
---

Keep the second space in `subgraph  S` of a flowchart or swimlane diagram when a
later statement such as `S --> Z` names the subgraph. It was printed
`subgraph S`, after which mermaid.js 10.9.8 to 11.17.2 draw that edge from a new
node and not from the subgraph.
