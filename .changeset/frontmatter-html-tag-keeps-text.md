---
"prettier-plugin-mmd": patch
---

Keep the text after the frontmatter as written when an HTML tag starts in the
frontmatter (`title: <a`) and ends after it. An `erDiagram` whose body was
`"b="c">d"` was printed with `"b="`, `c`, and `">d"` on three lines, which
mermaid.js rejects.
