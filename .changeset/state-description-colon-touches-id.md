---
"prettier-plugin-mmd": minor
---

Print the colon of a state description against the id of its state:
`A : waiting` is now printed `A: waiting`. The colon was printed with a space on
each side, the form of the label of a transition, but most of the state
descriptions in the mermaid.js documentation write it against the id, so the
same kind of line came out in a form that its examples do not use. Now the colon
of a description touches the id and has one space after it, which mermaid.js
reads the same, and the colon of a transition label keeps its space on each
side.
