---
"prettier-plugin-mmd": patch
---

Line up the colon of a Gantt task written after another statement on its line at
the first formatting: `axisFormat %m #a   : 1d` was printed with `#a   :1d` as
written on its own line, and the next formatting lined it up with the other
tasks.
