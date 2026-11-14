---
"prettier-plugin-mmd": minor
---

Separate `gantt` task names from their colons: `Short:a1, 2024-01-01, 3d`
becomes `Short : a1, 2024-01-01, 3d`. Such names were left as written because
the author had chosen the compact form, but mermaid.js draws the chart the same
either way, and a chart that mixed the two forms printed the same task in two
forms. Now such a name gets the space that the examples of the mermaid.js
documentation write, without changing the drawing.
