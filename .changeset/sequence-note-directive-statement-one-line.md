---
"prettier-plugin-mmd": patch
---

Keep a `sequenceDiagram` note and the statement after its directive on one line:
`Note over A:%%{init: {}}%%  ;actor B` was printed as
`Note over A:%%{init: {}}%%` and `actor B` on two lines, which mermaid.js 10.9.8
rejects.
