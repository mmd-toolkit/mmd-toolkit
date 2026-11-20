---
"prettier-plugin-mmd": patch
---

Print a statement and the comment line that follows it after a U+2028 or U+2029
on separate lines where only `;` and comment lines follow, in a `flowchart`, an
`agentflow`, a `sequenceDiagram`, a `quadrantChart`, and an `xychart-beta`, so
that formatting again changes nothing: `B --> C;;\u2028%% c`, an empty line, and
a line `;` now print `B --> C` and `%% c` on separate lines.
