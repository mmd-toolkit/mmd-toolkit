---
"prettier-plugin-mmd": minor
---

Print the arrows of `block` diagrams and the arrow of a `quadrantChart` axis in
their shortest form: `A ---> B` is now printed `A --> B`. Before, the length of
the line stayed as written, because it is the author's choice, so the same arrow
came out in two forms in one diagram although mermaid.js draws them the same.
Now only the shortest form is printed, and an arrow that some versions of
mermaid.js draw differently with another length, such as `---x`, stays as
written.
