---
"prettier-plugin-mmd": patch
---

Keep the second space in `subgraph  S` of a `flowchart` or `swimlane-beta`
diagram when a later statement such as `S --> Z` names the subgraph: it was
printed `subgraph S`, which draws that edge from the subgraph instead of a
separate node `S` in mermaid.js 10.9.8, 11.7.0, and 11.17.2 for `flowchart`, and
11.16.1 and 11.17.2 for `swimlane-beta`.
