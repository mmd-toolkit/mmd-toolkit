---
"prettier-plugin-mmd": patch
---

Keep the quotes of a `mindmap` or `kanban` label that a directive separates from
the dash of a `-)` closer: `f("x"%%{init: {}}%%-)` was printed
`f(x%%{init: {}}%%-)`, which mermaid.js draws differently.
