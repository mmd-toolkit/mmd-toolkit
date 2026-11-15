---
"prettier-plugin-mmd": patch
---

Print a form feed at the end of a `treemap` `classDef` or after its directive,
and before a same-line comment in `flowchart`, `swimlane`, `class`, `state`,
`block`, and `treemap`, as a space or a tab is printed: `classDef aa fill:red`
and a form feed becomes `classDef aa fill: red`. Before, the form feed stayed as
written, because the rule left alone every whitespace character other than a
space and a tab, so the same style came out in two forms depending on a
character that cannot be seen, although CSS reads a form feed as whitespace and
mermaid.js draws the same figure without it. Now it is left out, or printed as
one space before a comment, and a character that CSS does not read as
whitespace, such as a no-break space, stays, and so do the form feeds beside it.
