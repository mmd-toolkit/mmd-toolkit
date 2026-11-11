---
"prettier-plugin-mmd": minor
---

Print a text with or without quotes in the form that the examples in the
documentation of mermaid.js use at least twice as often, in `sankey`, `er`,
`requirement`, `wardley`, `gitgraph`, `quadrant`, `xychart`, `venn`, `usecase`,
`architecture`, `mindmap`, `kanban`, and `c4`, and in `flowchart` and `swimlane`
for the name of a subgraph, in `agentflow` for the names of a flow and a
connector and the title of a connector, and in `class` for the names of a class
and a namespace: `"CUSTOMER" ||--o{ "ORDER" : "places"` in `er` becomes
`CUSTOMER ||--o{ ORDER : places`, and `Login(Log in)` in `usecase` becomes
`Login("Log in")`. Before, the formatter kept a text with or without quotes as
written, because a quoted text can hold what a bare one cannot, so the same text
came out in two forms depending on how its author wrote it, although mermaid.js
reads both the same. Now the form changes only where mermaid.js reads both the
same, so a text stays as written where the other form would be read differently,
such as one with a comma.
