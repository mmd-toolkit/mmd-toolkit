---
"prettier-plugin-mmd": patch
---

Print a statement with a multi-line `@{ ... }` block as written under `useTabs`,
the indentation of its line included, instead of moving the lines of the block
with spaces to a depth that is right for one width of a tab only. A kanban node
and the header of an agentflow container still move the lines with the node.
