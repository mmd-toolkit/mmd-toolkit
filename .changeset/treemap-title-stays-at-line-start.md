---
"prettier-plugin-mmd": patch
---

Fix a `title`, `accTitle`, or `accDescr` of a `treemap` that was moved one step
in, which mermaid.js 11.8.1 rejects: one that starts its line now stays at the
start of its line, so `treemap` followed by `title T` and `"A": 1` is printed
with `title T` at the start of its line and `"A": 1` one step in.
