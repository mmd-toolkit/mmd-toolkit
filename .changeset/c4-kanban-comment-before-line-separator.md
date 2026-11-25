---
"prettier-plugin-mmd": patch
---

Fix a `c4` or `kanban` comment that is followed by a line starting with U+2028
or U+2029 being printed differently the second time it is formatted:
`Person(a,"A")  %% c` was printed `Person(a, "A")  %% c` and is now printed
`Person(a, "A") %% c`.
