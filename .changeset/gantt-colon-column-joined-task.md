---
"prettier-plugin-mmd": patch
---

Align the colons of a `gantt` section on their own where a task that a comment
line after a U+2028 or U+2029 joins to the next line keeps its colon in another
column, so that formatting again changes nothing:
`Task B long               :a2` becomes `Task B long : a2` next to a task
`Task A                    :a1, 2014-01-01, 3d\u2028%% c` that stays as written.
