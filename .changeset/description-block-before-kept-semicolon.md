---
"prettier-plugin-mmd": patch
---

Keep a description block as written where a `;` and a comment follow it on its
line: `accDescr {D}; %% c` in an XY chart, a quadrant chart, or an agentflow
diagram was printed `accDescr: D; %% c`, which mermaid.js reads as another
description. A `;` that a statement after the block holds does not keep it:
`accDescr {x} A->>B: x #a%%{init: {}}%%; %%{init: {}}%%` in a sequence diagram
is printed `accDescr: x` and the message on a line of its own.
