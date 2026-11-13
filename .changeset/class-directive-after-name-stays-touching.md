---
"prettier-plugin-mmd": patch
---

Fix output that mermaid.js rejects in a `classDiagram`:
`call%%{init: {}}%%()--> B` was printed with a space after `call`, as
`call %%{init: {}}%%()--> B`, and now stays as written.
