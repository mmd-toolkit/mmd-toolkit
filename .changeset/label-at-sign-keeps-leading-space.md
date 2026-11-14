---
"prettier-plugin-mmd": patch
---

Keep the spaces around a `flowchart` or `swimlane-beta` label that holds an `@`:
`A[ user@example.com ]` no longer becomes `A[user@example.com]`. Version 0.4.0
began to print such a label without the spaces, so that a label comes out in one
form, but several versions of mermaid.js reject `A[user@example.com]`, so a
diagram that drew there stopped drawing once it was formatted. Now the spaces
stay as written.
