---
"prettier-plugin-mmd": patch
---

Keep the space before a label whose first word has a `@` in flowchart and
swimlane diagrams: `A[ user@example.com ]` was printed `A[user@example.com]`.
The space was dropped because mermaid.js 12.3.0 reads both forms the same, but
mermaid.js 11.5.0 to 12.2.0 reject the form without it, so a formatted diagram
stopped drawing there. The space now stays in every shape and between `|`, and a
label that has no `@` in its first word, such as `A[ x y@z ]`, still loses its
padding.
