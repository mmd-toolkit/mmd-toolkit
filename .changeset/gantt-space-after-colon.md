---
"prettier-plugin-mmd": minor
---

Print one space after the colon of a Gantt task: `Task :a1, 2024-01-01, 30d` is
now printed `Task : a1, 2024-01-01, 30d`. The first item was printed against the
colon, as most task lines in the mermaid.js documentation are written, but
Prettier prints a space after a colon that follows a name, so the colons of a
formatted Gantt chart looked unlike the colons that Prettier prints in the rest
of a project. Now the first item stands after one space, which mermaid.js reads
the same, and a line that mermaid.js reads by the whitespace after its colon,
such as `classDef it:a1,2024-01-01,2d;#y:3d;z:2d`, stays as written.
