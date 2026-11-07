---
"prettier-plugin-mmd": minor
---

Print a `title` in `gantt`, `journey`, `timeline`, `sequence` and `venn`, and
the `dateFormat` and `axisFormat` of a `gantt`, without the whitespace at the
start of the text: `title   Plan` becomes `title Plan`. mermaid.js draws both
the same. The name of a `section` keeps its whitespace, since two sections whose
names differ by it are two sections, and so do a `tickInterval` and a
`dateFormat` of `D`, which are drawn differently with whitespace before them.
