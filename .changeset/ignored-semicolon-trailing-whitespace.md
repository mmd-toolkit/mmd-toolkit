---
"prettier-plugin-mmd": patch
---

Fix a line that ends with a `;` that mermaid.js ignores and spaces or tabs after
it, in `timeline`, `journey`, `treeView`, `radar`, `usecase`, `cynefin`, `info`,
`pie`, `gitGraph`, `packet`, `architecture`, `treemap`, `ishikawa`, and the
title of `gantt`: `title style fill:#f00 ;` followed by a space was printed with
the space before the `;` and, formatted again, without it, and is now printed
`title style fill:#f00;` at once.
