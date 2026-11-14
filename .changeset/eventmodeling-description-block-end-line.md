---
"prettier-plugin-mmd": patch
---

Fix an `eventmodeling` description block over several lines being separated from
what follows its `}` on its line, a statement or a `%%{{native}}%%`:
`y;} tf 17 evt End` below `accDescr {x` was split into two lines.
