---
"prettier-plugin-mmd": patch
---

Fix a `sequenceDiagram` whose `title` or `end` has a `;` that the line rule
ignores after it: `accDescr {style:#x} title x;` followed by two spaces and
`A->>B: style:#x;; end;` were printed with the `;` and, formatted again, without
it, and are now printed without it at once. A line such as `A->>B: x;end #;`,
which stays on one line because of the `;` of its comment, now keeps its `end`
too, where it was split and the `;` after `x` was dropped only the second time.
