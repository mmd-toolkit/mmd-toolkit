---
"prettier-plugin-mmd": patch
---

Print the colons of a `gantt` chart at once where a U+2028 and a comment line
follow a task. `Other                     :a3, after a2, 1d` in the next section
was printed `Other       : a3, after a2, 1d`, and `Other : a3, after a2, 1d`
only on the second formatting; it is now printed `Other : a3, after a2, 1d` at
once.
