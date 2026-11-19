---
"prettier-plugin-mmd": patch
---

Print a comment after a `;` that follows a name ending with `end` or `global` in
an `agentflow` `flow` or `connector` touching the name the first time, as the
second formatting already did: `flow Front end ;  %% c` printed
`flow Front end %% c` and now prints `flow Front end%% c`.
