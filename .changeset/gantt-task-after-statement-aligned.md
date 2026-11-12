---
"prettier-plugin-mmd": patch
---

Fix the colon of a Gantt task written after another statement on its line being
lined up only by a second formatting: `axisFormat %m #a   : 1d` was printed with
the task on its own line and its padding as written, and the next formatting
lined its colon up with the others. The first formatting now does.
