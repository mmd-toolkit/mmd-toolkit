---
"prettier-plugin-mmd": minor
---

Print an `accDescr { ... }` block that holds one line of text as
`accDescr: ...`, also when the text stands on a line of its own:
`accDescr {a b}` becomes `accDescr: a b`. Before, a block stayed a block
(`accDescr { a b }`) and `accDescr: a b` stayed as written, so one description
was printed in two forms depending on how its author wrote it, although
mermaid.js draws the same figure from both and its documentation never writes a
description in a block on one line. A block stays a block where `accDescr: ...`
would not hold or read the description the same, such as a text over several
lines.
