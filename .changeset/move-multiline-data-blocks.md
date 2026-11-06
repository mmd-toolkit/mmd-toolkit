---
"prettier-plugin-mmd": minor
---

Move multi-line data blocks with their statements. In `flowchart`, `agentflow`,
`kanban`, and `sequence`, the lines of a `@{ ... }` that opens at the end of a
line now stand one step inside the statement, with a `}` on its own line at the
level of the statement, and the same holds for `json` tables in `usecase`. They
used to stay at the columns where they were written. mermaid.js reads the lines
and what stands before the `}`, so the differences between the lines stay,
spaces indent them also with `useTabs`, and a block that moving would make
mermaid.js read differently stays as written.
