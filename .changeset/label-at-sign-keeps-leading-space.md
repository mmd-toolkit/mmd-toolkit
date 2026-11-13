---
"prettier-plugin-mmd": patch
---

Keep the spaces around labels such as `A[ user@example.com ]` (previously
printed `A[user@example.com]`) in `flowchart` and `swimlane-beta`, and print
`A[/ a@"b" /]` as `A[/a@"b"/]` in `agentflow-beta`.
