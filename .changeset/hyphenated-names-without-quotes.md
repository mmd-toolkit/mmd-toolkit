---
"prettier-plugin-mmd": minor
---

Print a name with a `-` between its parts without quotes in `erDiagram`,
`flowchart`, `swimlane-beta`, `agentflow-beta`, and `quadrantChart`:
`"LINE-ITEM" ||--o{ ORDER : has` becomes `LINE-ITEM ||--o{ ORDER : has`. Before,
a name with a `-` kept its quotes, because only names of letters, digits, and
`_` were known to be read the same without them, so `LINE-ITEM` and `ORDER` came
out in two forms in one diagram. Now such a name is printed without quotes, and
a name that mermaid.js reads differently, such as `end-x`, keeps them.
