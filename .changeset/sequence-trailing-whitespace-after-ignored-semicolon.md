---
"prettier-plugin-mmd": patch
---

Fix a `sequenceDiagram` line that ends with a `;` and whitespace after a
comment: `accDescr {} A->>B: x #style:#x; ` was printed on one line and,
formatted again, on two lines, and is now printed on two lines at once.
