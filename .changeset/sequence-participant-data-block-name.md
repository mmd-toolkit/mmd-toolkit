---
"prettier-plugin-mmd": patch
---

Keep a `participant` or `actor` of a `sequenceDiagram` as written where
mermaid.js 10.9.8 and 11.7.0 read its data block as a part of the name:
`participant A @{x}` no longer becomes `participant A@{ x }`. Version 0.5.0
began to attach the block to the name and to print one space inside each of its
ends, as mermaid.js 12.3.0 reads the same participant either way, but those two
versions then draw a participant with another name. Now such a line stays as
written, and a block that they do not read as a name, such as
`@{ "type": "queue" }`, is printed as before.
