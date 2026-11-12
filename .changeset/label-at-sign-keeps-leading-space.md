---
"prettier-plugin-mmd": patch
---

Fix a label whose first word has a `@` losing the space before it in flowchart
and swimlane diagrams: `A[ user@example.com ]` was printed
`A[user@example.com]`, which mermaid.js 11.12.3 to 12.0.0 reject.
