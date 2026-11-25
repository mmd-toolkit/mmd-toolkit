---
"prettier-plugin-mmd": patch
---

Print a comment in `c4` and `kanban` with one space before it when a U+2028
follows it: `Person(a,"A")  %% c` is now printed `Person(a, "A") %% c`, not
`Person(a, "A")  %% c`.
