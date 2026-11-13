---
"prettier-plugin-mmd": minor
---

Print a string after the `(-` opener of a mindmap or kanban shape without its
quotes: `f(-"x")` becomes `f(-x)`. Before, since 0.8.0, the quotes stayed next
to the dash of an opener as they do before a `-)` closer, so the same label came
out in two forms although mermaid.js draws both the same after `(-`. Now the
quotes stay only before a `-)` closer, which a text without quotes does not
close.
