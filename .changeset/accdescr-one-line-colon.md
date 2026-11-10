---
"prettier-plugin-mmd": minor
---

Print an `accDescr` block that holds one line of text with a colon, in every
diagram type that reads both forms: `accDescr { a }` becomes `accDescr: a`, also
where the text stands on a line of its own, holds a no-break space or another
whitespace character, or has a directive inside it or beside the braces, and
where a comment or a directive follows the block. Before, the formatter kept
such a block as a block (`accDescr {a}` became `accDescr { a }`) next to the
colon form, so one description was printed in two forms depending on how its
author wrote it, although mermaid.js draws the same figure from both and its
documentation writes a description with the colon, or in a block over several
lines, and never in a block on one line. The earlier rule kept every block whose
text had a line break, a whitespace character other than a space or a tab, or a
comment or a directive beside it, although the colon form reads most of these
the same. A block stays a block where the colon form is read otherwise or has no
place for what the block holds, in this order: a text over several lines; a text
that holds `direction` and stands after a line terminator or has a directive in
the word, in a diagram type that reads a line with `direction` as the direction
of the diagram; a directive beside the braces in a block over several lines, or
in a block followed by another statement on a line that keeps its statements
together; a comment after the `}` in a diagram type that takes the `%%` as part
of the text of the colon form; a block with no text or only a directive; a block
that is not closed; a block followed by another statement or a `;` on a line
that keeps its statements together or that the line rule of mermaid.js reads; a
text with a `%%` or a line separator in an architecture, cynefin, gitGraph,
info, packet, pie, radar, railroad, treemap, treeView, or wardley diagram; a
block with a line separator in a state diagram; a block in an event modeling
diagram, which stores the token as written, or in an ishikawa diagram, which
reads both forms as nodes; and a block whose text holds a character of the box
of a treeView, or whose box keeps the characters between the keyword and the
brace.
