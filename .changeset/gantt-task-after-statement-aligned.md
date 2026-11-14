---
"prettier-plugin-mmd": patch
---

Line up the colon of a `gantt` task on the first formatting even when another
statement precedes it: after `Short   : 1d`, `axisFormat %m #a   : 1d` now
prints as `axisFormat %m` and `#a    : 1d` on separate lines.
