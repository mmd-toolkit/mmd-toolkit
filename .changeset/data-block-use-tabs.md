---
"prettier-plugin-mmd": patch
---

Print a statement with a multi-line `@{ ... }` block as written under `useTabs`,
the indentation of its line included, instead of moving the lines of the block
with spaces to a depth that is right for one width of a tab only. A kanban node,
the header of an agentflow container, and a statement that is not at the depth
of the first thing on its line (`subgraph s; A@{`, `B; end; A@{`), or whose line
starts in the middle of an earlier statement, still move the lines with the
node.
