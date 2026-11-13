---
"prettier-plugin-mmd": patch
---

Keep the quotes of a mindmap or kanban label that a directive separates from the
dash of a `-)` closer: `f("x"%%{init: {}}%%-)` was printed
`f(x%%{init: {}}%%-)`, which mermaid.js draws differently. Print a string after
the `(-` opener without quotes: `f(-"x")` becomes `f(-x)`, which mermaid.js
draws the same.
