---
"prettier-plugin-mmd": minor
---

Decide each line break of a statement on its own in `sequence`, `class`,
`block`, `er`, `gantt`, `journey`, `quadrant`, `timeline` and `xychart`: a line
break next to a comment or a directive, or one that joining would make the line
rule of mermaid.js read otherwise, stays, and the others become whitespace. In a
`sequence`, `autonumber`, `5 %%{init: {}}%%`, and `2` on three lines become
`autonumber 5 %%{init: {}}%%` and `2` on two. A statement that keeps a line
break keeps its styles as written.
