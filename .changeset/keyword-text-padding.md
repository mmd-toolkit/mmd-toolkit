---
"prettier-plugin-mmd": minor
---

Print a `title` in `gantt`, `journey`, `timeline`, `sequence`, `venn` and `c4`,
the `accDescription` of a `c4`, and the `dateFormat` and `axisFormat` of a
`gantt`, without the whitespace at the start and at the end of the text:
`title   Plan  ` becomes `title Plan`. The last event of a line of a `timeline`
and the second description of an alias in a `stateDiagram` lose the whitespace
at their end in the same way. mermaid.js draws both the same. The name of a
`section` keeps its whitespace, since two sections whose names differ by it are
two sections, and so do a `tickInterval`, a `todayMarker`, and a `dateFormat` of
`D`, which are drawn differently with whitespace around them.
