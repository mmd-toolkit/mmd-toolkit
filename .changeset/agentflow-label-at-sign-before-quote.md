---
"prettier-plugin-mmd": minor
---

Print an `agentflow-beta` label whose `@` stands before a `"` or a `{` without
the spaces inside its brackets: `A[/ a@"b" /]` becomes `A[/a@"b"/]`. Before,
since 0.4.0, every label with an `@` kept its spaces in an `agentflow-beta`,
because mermaid.js rejects `A[x@]` there, so this label came out in two forms
although mermaid.js draws both the same. Now only a label that needs the spaces
keeps them, such as `A[ user@example.com ]`.
