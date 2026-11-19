---
"prettier-plugin-mmd": patch
---

Print a comment after a `;` that follows a name ending with `end` or `global` in
an `agentflow` `flow` or `connector` touching the name, so that the second
formatting changes nothing: `flow Front end ;  %% c` now prints
`flow Front end%% c`, where it printed `flow Front end %% c`.
