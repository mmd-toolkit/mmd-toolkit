---
"prettier-plugin-mmd": patch
---

Keep the rows of a `treemap` as written where a directive that is not closed
joins two of them: `"A" %%{x: w` followed by `  "B": 1` lost the space before
the `%%{`, which made `B` a sibling of `A` instead of its child.
