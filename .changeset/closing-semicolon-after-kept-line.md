---
"prettier-plugin-mmd": patch
---

Drop the `;` after the `end` of a flowchart `subgraph` or an agentflow `flow`
that has moved to a line of its own, so that formatting the file again changes
nothing: `flow F[x;]; A --> B; end ;  %% c` printed `end ; %% c` and then
`end %% c`, and now prints `end %% c`.
