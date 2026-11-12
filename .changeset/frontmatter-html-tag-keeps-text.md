---
"prettier-plugin-mmd": patch
---

Keep the text after the frontmatter as written when an HTML tag starts in the
frontmatter and ends after it, as `title: <a` does with a `>` in the diagram.
mermaid.js rewrites the quotes in such a tag up to its first `>`, so formatting
could turn an `erDiagram` that it accepts into one that it rejects.
