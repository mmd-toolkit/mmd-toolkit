---
"prettier-plugin-mmd": patch
---

Fix a class body inside a `namespace` of a `classDiagram` that was printed
differently when it was formatted a second time:
`namespace Alpha { class Beta { +style:#x; } }` is printed with each `}` on a
line of its own at the first formatting.
