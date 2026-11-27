---
"prettier-plugin-mmd": patch
---

Print an `agentflow` `flow` or `connector` whose name holds a directive and is
followed by a `;` as it is printed without the `;`, in one formatting:
`flow Front fin %%{x}%% ;` at the end of a line, which kept a space at the end
of the line, is now printed `flow Front fin%%{x}%%`, and
`flow Front fin %%{x}%% ;  %% c`, which a second formatting changed, is now
printed `flow Front fin %%{x}%% %% c` at once.
