---
"prettier-plugin-mmd": patch
---

Keep a `timeline` title whose text starts with `#` on the line where it was
written: `title` followed by an indented line `# c` was printed `title # c`,
which mermaid.js 10.9.8 reads as a period.
