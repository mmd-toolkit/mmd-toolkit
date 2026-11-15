---
"prettier-plugin-mmd": patch
---

Fix a description block that lost its text in `flowchart`, `swimlane`, and
`agentflow` when a direction followed it on its line:
`accDescr {D;} direction TB;` was printed indented, which made mermaid.js read
the whole line as a direction, and is now printed at the first column as
written.
