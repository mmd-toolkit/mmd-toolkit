---
"prettier-plugin-mmd": minor
---

Print an `accDescr` block that holds one line of text with a colon, in every
diagram type that reads both forms: `accDescr { a }` becomes `accDescr: a`.
mermaid.js draws the same figure from the block and from the colon, and its
documentation writes a description only with the colon or over several lines, so
the formatter no longer keeps a block on one line as a second spelling of the
same description.
