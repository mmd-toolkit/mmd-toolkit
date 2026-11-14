---
"prettier-plugin-mmd": patch
---

Fix an `eventmodeling` diagram that came out differently when it was formatted a
second time: `given evt A %%{{tail}}%%` after `gwt 01` and a `%%{{one}}%%` line
was printed with the `%%{{tail}}%%` on a line of its own, and with `evt A` below
`given` the next time, and it now stays on one line.
