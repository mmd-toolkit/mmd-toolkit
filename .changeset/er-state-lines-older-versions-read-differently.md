---
"prettier-plugin-mmd": patch
---

Keep the lines of an ER diagram and a state diagram that some versions of
mermaid.js read differently from the version this package follows, instead of
moving their statements to lines of their own: `12a`, `endé`, `% not a comment`,
and `click A href "u" accDescr {}` stay as written. The formatted text of these
lines was drawn differently by those versions, or rejected.
