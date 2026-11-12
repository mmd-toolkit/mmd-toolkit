---
"prettier-plugin-mmd": patch
---

Fix three forms of `timeline` that mermaid.js before 11.14 drew differently
after formatting: `timeline td` was printed `timeline TD`, `timeline TD title T`
was split into two lines, and `title` followed by a line `# c` was joined into
`title # c`. Those versions read the words after `timeline` as a period, so now
a direction keeps its case, the text after a direction stays on the line of the
header, and that title stays as written.
