---
"prettier-plugin-mmd": patch
---

Align the colons of a `gantt` chart as formatting it again would, where a task
that a U+2028 and a comment line follow stays as written in a column of its own.
`Other                     :a3, after a2, 1d` in the section after it was
printed `Other       : a3, after a2, 1d` and then `Other : a3, after a2, 1d`,
and is now printed `Other : a3, after a2, 1d` at once.
