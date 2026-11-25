---
"prettier-plugin-mmd": patch
---

Fix a directive and a comment that follow a comment line ending at U+2028 or
U+2029 changing when they are formatted a second time, in `sequence`, `state`,
`requirement`, `timeline`, `journey`, `gantt`, `railroad`, `xychart`, and
`usecase` diagrams: `# c`, U+2028, `%%{x}%%  %% c` printed two spaces between
the directive and the comment and now prints one.
