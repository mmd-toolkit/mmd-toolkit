---
"prettier-plugin-mmd": patch
---

Keep an `erDiagram` statement that starts with whitespace other than a space or
a tab, such as a line separator (U+2028 or U+2029) or a no-break space, on its
line where more of the statement follows it: `"Alpha"`, a no-break space, and
`{ int x }` on one line was printed with the no-break space and the block on
lines of their own, which mermaid.js 10.9.8 and 11.7.0 reject.
