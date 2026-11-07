---
"prettier-plugin-mmd": minor
---

Print the `:` and the text of a one-line `note` in `stateDiagram` with one space
before the `:` and one after it where mermaid.js drops them:
`note right of A: x` becomes `note right of A : x`. mermaid.js reads the same
text and draws the same note. A note whose first two characters after the id are
not a `:` and a space or a tab stays as written.
