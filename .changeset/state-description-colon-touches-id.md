---
"prettier-plugin-mmd": minor
---

Print the colon of a `stateDiagram` description against the id of its state:
`A : waiting` is now printed `A: waiting`. The colon was printed with a space on
each side to match a transition label, so state descriptions looked unlike the
descriptions in the mermaid.js documentation. Now a description uses the form of
those examples while transition labels keep one space on each side of the colon.
