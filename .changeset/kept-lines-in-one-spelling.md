---
"prettier-plugin-mmd": patch
---

Keep a `sequenceDiagram` note and the statement after its directive on one line:
`NOTE OVER A:%%{init: {}}%%  ;ACTOR B` now becomes
`Note over A:%%{init: {}}%%  ;actor B`, avoiding a line break that mermaid.js
10.9.8 rejects.
