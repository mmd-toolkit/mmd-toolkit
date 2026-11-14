---
"prettier-plugin-mmd": patch
---

Print the attribute block of an `erDiagram` entity over several lines as any
attribute block also on a line that stays as written, such as after an entity
`1` that touches a letter: `1A {`, a line break, and `}` now becomes `1A { }`.
Before, the `}` of an empty block, and the block of an entity that stood later
on a line that a comment line joined, stayed as written, because mermaid.js
reads the text up to the `{` as one line, so an empty block written over several
lines stayed over several lines, although it is ` { }` everywhere else. Now the
`}` and the attributes below the `{` line are printed as in any other block,
keeping the text up to the `{` of a line that a comment line joined as written.
