---
"prettier-plugin-mmd": patch
---

Print an `xychart-beta` `accDescr { ... }` block as `accDescr: ...` at the first
formatting where a comment follows the statement after the block on its line:
`accDescr { a } title T %% c` kept the block at the first formatting and became
`accDescr: a` at the second.
