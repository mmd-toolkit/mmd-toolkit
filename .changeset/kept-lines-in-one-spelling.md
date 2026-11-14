---
"prettier-plugin-mmd": patch
---

Print the keywords, strings, and numbers of a line whose whitespace stays as
written in the same form as on the other lines: in a `gantt`, the line
`EXCLUDES  %%{init: {}}%%` with a space after the directive kept its capitals,
and is now printed with `excludes`.
