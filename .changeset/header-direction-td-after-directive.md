---
"prettier-plugin-mmd": minor
---

Print the direction `TD` of an `agentflow-beta` or a `swimlane-beta` header as
`TB` also after a directive: `agentflow-beta%%{init: {}}%% TD` becomes
`agentflow-beta %%{init: {}}%%TB`. Version 0.6.0 began to print `TD` as `TB` in
these headers, but left it as written after a directive, so the same direction
came out in two forms although mermaid.js draws both the same. Now it is printed
`TB` in both places.
