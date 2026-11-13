---
"prettier-plugin-mmd": patch
---

Keep the second space in `subgraph  S` of a flowchart or swimlane diagram when a
later statement such as `S --> Z` names the subgraph. Printed `subgraph S`, that
edge started at the subgraph, where mermaid.js 10.9.8 to 11.17.2 draw it from a
separate node `S`.
