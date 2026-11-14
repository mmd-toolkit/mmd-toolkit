---
"prettier-plugin-mmd": minor
---

Print the statements of a `venn-beta` diagram one step under its header: `set A`
under the header was printed at column one, and is now printed with two spaces
before it. The statements stood at column one so that indenting could not change
how mermaid.js reads a `text` line, but that left every `venn-beta` diagram
without the indentation of the mermaid.js documentation's examples. Now `set`,
`union`, `style`, and `title` stand one step deep, and a `text` line with its
own target stays level with the header.
