---
"prettier-plugin-mmd": minor
---

Print a space after the `block:` of a nested block in a `block` diagram:
`block:group1:2` becomes `block: group1:2`. Until now, since the first release,
the node touched the colon because the examples of mermaid.js write it so,
although the space makes the node easier to distinguish from the keyword. Now
the node follows one space, which mermaid.js reads the same.
