---
"prettier-plugin-mmd": minor
---

Print a Gantt task whose name touches its colon with one space before the colon:
`Short:a1, 2024-01-01, 3d` was printed as written, and is now printed
`Short : a1, 2024-01-01, 3d`. Such names were left as written because the author
had chosen the compact form, but mermaid.js draws the chart the same either way,
and a chart that mixed the two forms, or lined up some of its colons, printed
the same task in two forms. Now such a name gets the space that the examples of
the mermaid.js documentation write, and the drawing does not change.
