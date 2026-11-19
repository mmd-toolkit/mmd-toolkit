---
"prettier-plugin-mmd": patch
---

Print one space before a comment in a `c4` or `kanban` diagram where the next
line is indented with a U+2028 or U+2029, as it is without them:
`Person(a,"A")  %% c`, a line feed, a U+2028, and `Person(b,"B")` now give
`Person(a, "A") %% c`, where the two spaces stayed until the file was formatted
again.
