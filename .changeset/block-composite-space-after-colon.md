---
"prettier-plugin-mmd": minor
---

Print a space after the `block:` of a nested block in a block diagram:
`block:group1:2` becomes `block: group1:2`. Until now, since 0.1.0, the node
touched the colon because the examples of mermaid.js write it so, although a
keyword is followed by one space in every other diagram type and the space reads
better. mermaid.js reads both forms the same, and a space before the colon
(`block : G`) is still never printed.
