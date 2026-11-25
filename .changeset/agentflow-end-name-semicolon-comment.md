---
"prettier-plugin-mmd": patch
---

Fix the text of an `agentflow` `flow` or `connector` whose name is followed by a
`;` and a comment changing when it is formatted a second time:
`flow Front end ;  %% c` was printed `flow Front end %% c` and is now printed
`flow Front end%% c`.
