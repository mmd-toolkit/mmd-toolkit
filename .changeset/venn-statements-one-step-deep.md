---
"prettier-plugin-mmd": minor
---

Print the statements of a Venn diagram one step under `venn-beta`: `set A` under
the header was printed at column one, and is now printed with two spaces before
it. The statements stood at column one so that indenting could not change how
mermaid.js reads a `text` line, but that left every Venn diagram without the
indentation that the examples of the mermaid.js documentation have. Now `set`,
`union`, `style`, and `title` stand one step deep, which mermaid.js reads the
same; a `text` line under a `set` stands one step deeper, and a `text` line with
its own target (`text A item`) stays level with `venn-beta`, where indenting it
could attach it to the set above.
