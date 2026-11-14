---
"prettier-plugin-mmd": patch
---

Fix an `erDiagram` that lost an entity when it was formatted: `A {`, `int id`,
and `}`, followed by U+2028 and a comment line `%% d`, declares the entity A and
an entity named by the U+2028 in mermaid.js, and the formatter printed the
U+2028 at the start of the next line, where the comment line takes it.
