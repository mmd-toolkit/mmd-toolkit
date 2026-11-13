---
"prettier-plugin-mmd": patch
---

Keep a `sequenceDiagram` note and the statement after its directive on one line:
`NOTE OVER A:%%{init: {}}%%  ;ACTOR B` was split into
`Note over A:%%{init: {}}%%` and `actor B` on two lines, which mermaid.js 10.9.8
rejects.
