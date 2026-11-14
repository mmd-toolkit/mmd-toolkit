---
"prettier-plugin-mmd": patch
---

Keep an `erDiagram` statement that starts with a line separator (U+2028 or
U+2029) on its line where more of the statement follows the separator:
`"Alpha"`, a U+2028, and `{ int x }` on one line was printed with the separator
and the block on lines of their own, which mermaid.js 10.9.8 and 11.7.0 reject.
