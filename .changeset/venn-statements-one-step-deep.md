---
"prettier-plugin-mmd": minor
---

Print the statements of a Venn diagram one step under `venn-beta`: `set A` under
the header was printed at column one, and is now printed with two spaces before
it. Statements stood at column one because only the indentation of an implicit
`text` statement changes how mermaid.js reads it, but that left every Venn
diagram without the indentation that the examples of the mermaid.js
documentation and the other diagram types have. Now `set`, `union`, `style`, and
`title` stand one step deep and an implicit `text` one step deeper, while an
explicit `text A item` stays at the level of the header, where indenting it
could make it an implicit one.
