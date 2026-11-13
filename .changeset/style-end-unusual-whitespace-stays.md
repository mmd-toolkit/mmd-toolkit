---
"prettier-plugin-mmd": patch
---

Keep unusual trailing whitespace needed for the drawing in the styles of
`flowchart`, `classDiagram`, `agentflow-beta`, and `erDiagram`:
`classDef c fill:red` followed by a no-break space (U+00A0) stays as written in
`classDiagram`.
