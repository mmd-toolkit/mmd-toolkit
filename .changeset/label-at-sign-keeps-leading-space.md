---
"prettier-plugin-mmd": patch
---

Keep the space before a label whose first word has a `@` in flowchart and
swimlane diagrams: `A[ user@example.com ]` was printed `A[user@example.com]`
since 0.4.0. The space was dropped because mermaid.js 12.3.0 reads both forms
the same, but mermaid.js 11.7.0 to 12.0.0 reject the form without it, so a
formatted diagram stopped drawing there. The space now stays in every shape and
between `|`, but not before a `@` that a `{` or a `"` follows, as in
`A[ a@"b" ]`, nor in a label with no `@` in its first word, such as
`A[ x y@z ]`.
