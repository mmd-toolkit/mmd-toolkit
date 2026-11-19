---
"prettier-plugin-mmd": patch
---

Print one space between a directive and a comment that follow the U+2028 or
U+2029 ending a `#`, `%`, or `;` comment line, so that formatting the file again
changes nothing: `% c`, the character, `%%{x}%%`, two spaces, `%% c`, and a
blank line print `%%{x}%% %% c` on a line of its own in `sequence`,
`requirement`, `timeline`, `journey`, `gantt`, `railroad`, `xychart`, and
`usecase` diagrams.
