---
"prettier-plugin-mmd": patch
---

Fix a `wardley` link whose long arrow touches the name before it: `Alpha-->Beta`
was printed `Alpha- -> Beta`, which mermaid.js 11.14.0 rejects. It is now
printed `Alpha--> Beta`.
