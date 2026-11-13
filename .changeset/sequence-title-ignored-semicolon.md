---
"prettier-plugin-mmd": patch
---

Drop the `;` that `sequenceDiagram` ignores between `title` and a text on the
next line, so that the title stays one statement:
`participant A@{"style":"x:#y"};title;` followed by `T` on the next line prints
`title T`.
