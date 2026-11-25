---
"prettier-plugin-mmd": patch
---

Fix the colon padding of a `gantt` task that follows a task ending in U+2028 and
a comment: `Other                     :a3, after a2, 1d` is now printed
`Other : a3, after a2, 1d`, not `Other       : a3, after a2, 1d`.
