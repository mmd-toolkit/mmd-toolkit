---
"prettier-plugin-mmd": patch
---

Print one space before a comment in a `c4` or `kanban` diagram where the next
line starts with a U+2028 or U+2029: `Person(a,"A")  %% c` becomes
`Person(a, "A") %% c` when `\u2028Person(b,"B")` follows on the next line.
