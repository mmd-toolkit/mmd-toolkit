---
"prettier-plugin-mmd": minor
---

Print one space after the colon of a `gantt` task: `Task :a1, 2024-01-01, 30d`
becomes `Task : a1, 2024-01-01, 30d`. The first item was printed against the
colon, as task examples in the mermaid.js documentation are written, but
Prettier prints a space after a colon that follows a name, so formatted tasks
looked unlike names and values in the rest of a project. Now the first item
stands after one space without changing the drawing.
