---
"prettier-plugin-mmd": patch
---

Keep a Wardley name that ends with `-` touching its arrow when a directive
stands between them: `Alpha-%%{init: {}}%%->Beta` was printed with a space after
`Alpha-`, which mermaid.js 11.14.0 rejects.
