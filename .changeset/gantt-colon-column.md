---
"prettier-plugin-mmd": minor
---

Put the colons of the tasks of a Gantt `section` one space after its longest
name when some names are padded. `Short   :a1, 2014-01-01, 3d` above
`Another long task          :a2, after a1, 2d` becomes:

```mmd
Short             :a1, 2014-01-01, 3d
Another long task :a2, after a1, 2d
```
