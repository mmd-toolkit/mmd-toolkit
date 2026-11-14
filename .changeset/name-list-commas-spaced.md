---
"prettier-plugin-mmd": minor
---

Print one space after each comma of a list of names in `erDiagram`,
`requirementDiagram`, `usecase-beta`, `stateDiagram`, `classDiagram`, and
`sequenceDiagram`: `class A,B c,d` becomes `class A, B c, d`. These lists were
printed with the commas touching the names, since the first version in
`erDiagram`, `requirementDiagram`, and `usecase-beta` and since 0.5.0 in the
others, as the mermaid.js documentation writes them, but Prettier prints a space
after a comma in every language it formats, so a file formatted by Prettier lost
a space that it prints elsewhere. Now a comma touches the name before it and has
one space after it, which mermaid.js reads the same.
