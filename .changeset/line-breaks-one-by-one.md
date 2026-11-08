---
"prettier-plugin-mmd": minor
---

Decide each line break of a statement on its own in `sequence`, `class`,
`block`, `er`, `gantt`, `journey`, `quadrant`, `timeline` and `xychart`: a line
break next to a comment or a directive, or one that joining would change what
mermaid.js reads, stays, and the others become whitespace. In a `sequence`,
`autonumber` with a space at the end of its line, and `5` on the next line,
become `autonumber 5`. A statement that keeps a line break keeps its styles as
written.
