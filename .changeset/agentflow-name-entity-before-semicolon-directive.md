---
"prettier-plugin-mmd": patch
---

Fix an `agentflow` `flow` or `connector` name such as `Front#fin` followed by a
`;` and a directive being rejected by mermaid.js after formatting:
`flow Front#fin ;  %%{x}%%` was printed `flow Front#fin; %%{x}%%` and is now
printed `flow Front#fin ; %%{x}%%`.
