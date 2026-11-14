---
"prettier-plugin-mmd": patch
---

Fix an `eventmodeling` statement that follows the `}` of a description block
written over several lines being moved off its line: `y;} tf 17 evt End` below
`accDescr {x` was split into two lines, and the space before `tf 23 evt End`
after `%%{wrap foo` was dropped.
