---
"prettier-plugin-mmd": minor
---

Print an `accDescr` block that holds one line of text with a colon, in every
diagram type that reads both forms: `accDescr { a }` becomes `accDescr: a`.
Before, the formatter kept such a block as a block (`accDescr {a}` became
`accDescr { a }`) next to the colon form, so one description was printed in two
forms depending on how its author wrote it, although mermaid.js draws the same
figure from both and its documentation writes a description with the colon, or
in a block over several lines, and never in a block on one line. A block that
mermaid.js reads differently from the colon form stays a block: one over several
lines, an empty one, one that is not closed, one with a comment or a directive
in it or after it on its line, and, in an architecture, cynefin, gitGraph, info,
packet, pie, radar, railroad, treemap, treeView, or wardley diagram, one whose
text holds a `%%`.
