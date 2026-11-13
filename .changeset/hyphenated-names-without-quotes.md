---
"prettier-plugin-mmd": minor
---

Print a name or text with a `-` between its parts without quotes in `erDiagram`,
`flowchart`, `swimlane-beta`, `agentflow-beta`, and `quadrantChart`:
`"LINE-ITEM" ||--o{ ORDER : has` becomes `LINE-ITEM ||--o{ ORDER : has`. Before,
since 0.8.0, a name with a `-` kept its quotes to avoid changing how mermaid.js
reads the name, so `LINE-ITEM` and `ORDER` came out in two forms in one diagram.
Now such a name is printed without quotes while a name that mermaid.js reads
differently keeps them.
