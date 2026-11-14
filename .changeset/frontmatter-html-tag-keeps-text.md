---
"prettier-plugin-mmd": patch
---

Keep the text after frontmatter as written when an HTML tag starts in the
frontmatter and ends after it: an `erDiagram` with `title: <a` in its
frontmatter and the body `"b="c">d"` now keeps that body on one line instead of
splitting it into three lines that mermaid.js rejects.
