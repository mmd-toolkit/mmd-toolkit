---
"prettier-plugin-mmd": patch
---

Print one space between a directive and a comment that follow the U+2028 or
U+2029 ending a comment line that starts with `#`, `%`, or `;`, or the text of
an `accTitle:` or `accDescr:` line, in `sequence`, `state`, `requirement`,
`timeline`, `journey`, `gantt`, `railroad`, `xychart`, and `usecase` diagrams,
so that formatting again changes nothing: `# c`, `\u2028`, `%%{x}%%`, two
spaces, and `%% c` now print `%%{x}%% %% c` on a line of its own.
