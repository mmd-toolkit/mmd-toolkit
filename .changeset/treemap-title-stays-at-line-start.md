---
"prettier-plugin-mmd": patch
---

Keep an unindented `title`, `accTitle`, or `accDescr` of a `treemap` at the
start of its line: `title T` no longer becomes `  title T`, which mermaid.js
11.8.1 rejects.
