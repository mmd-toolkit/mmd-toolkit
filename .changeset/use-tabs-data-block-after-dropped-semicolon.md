---
"prettier-plugin-mmd": patch
---

Fix a node with a `@{ … }` block of several lines after a `;` that starts its
line outside a subgraph in a `flowchart` or an `agentflow` diagram with
`useTabs`: the node stayed in the column of the `;`, which is removed, and now
moves to the depth of the statements around it with its block, as `C` and
`; A@{ … }` on the next line print `A@{` one tab in, under `C`.
