---
"prettier-plugin-mmd": patch
---

Keep the text after the frontmatter as written when an HTML tag starts in the
frontmatter and ends after it (`title: <a` with a `>` in the diagram):
formatting changed the quotes in the diagram, which turned an `erDiagram` that
mermaid.js accepts into one that it rejects.
