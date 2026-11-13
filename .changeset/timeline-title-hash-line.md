---
"prettier-plugin-mmd": patch
---

Keep a `timeline` title whose text starts with `#` as written: `title  # c`,
with two spaces, was printed `title # c`, which mermaid.js 10.9.8 reads as a
period.
