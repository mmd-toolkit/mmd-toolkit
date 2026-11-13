---
"prettier-plugin-mmd": patch
---

Keep the statements of an ER or a state line together where some version of
mermaid.js reads them differently on lines of their own: `12a` was printed as
`12` and `a` on two lines and now stays `12a`, and `% not a comment` stays on
one line.
