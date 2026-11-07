---
"prettier-plugin-mmd": minor
---

Print a data block on one line that holds nothing but spaces and tabs, or
nothing, as `@{ }` in `flowchart`, `agentflow`, `kanban` and `sequence`: `A@{}`
and `A@{   }` become `A@{ }`. mermaid.js reads an empty mapping for all three
and draws the same figure.
