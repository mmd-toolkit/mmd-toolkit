---
"prettier-plugin-mmd": minor
---

Decide each line break of a `sequence` statement on its own: a line break next
to a comment or a directive, or one that joining would make the line rule of
mermaid.js read otherwise, stays, and the others become whitespace.
`autonumber`, `5 %%{init: {}}%%`, and `2` on three lines become
`autonumber 5 %%{init: {}}%%` and `2` on two.
