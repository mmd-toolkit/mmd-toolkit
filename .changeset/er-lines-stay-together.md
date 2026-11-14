---
"prettier-plugin-mmd": patch
---

Keep adjacent `erDiagram` statements on one line when splitting them changes the
drawing in mermaid.js 11.7.0: `12a` was printed as `12` and `a` on two lines,
and now stays `12a`.
