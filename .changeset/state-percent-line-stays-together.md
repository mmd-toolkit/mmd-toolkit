---
"prettier-plugin-mmd": patch
---

Keep a `stateDiagram` line starting with `%` together: `% not a comment` was
printed as four lines, which some older versions of mermaid.js draw as states
instead of reading the whole line as a comment.
