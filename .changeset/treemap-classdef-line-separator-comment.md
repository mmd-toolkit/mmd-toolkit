---
"prettier-plugin-mmd": patch
---

Indent the row after a `treemap` `classDef` that ends in U+2028 and a comment by
four spaces: `"A": 1` is now printed `    "A": 1`, not at the first column.
