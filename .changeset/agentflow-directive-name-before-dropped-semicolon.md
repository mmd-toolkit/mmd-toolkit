---
"prettier-plugin-mmd": patch
---

Fix an `agentflow` `flow` or `connector` whose name holds a directive and is
followed by a `;` changing when it is formatted a second time:
`flow Front fin %%{x}%% ;  %% c` was printed `flow Front fin %%{x}%%  %% c` and
is now printed `flow Front fin %%{x}%% %% c`.
