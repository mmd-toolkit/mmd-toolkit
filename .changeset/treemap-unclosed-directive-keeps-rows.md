---
"prettier-plugin-mmd": patch
---

Keep the rows of a `treemap` or a `treeView-beta` as written where text that
mermaid.js removes joins two of them: in a `treemap`, `"A" %%{x: w` followed by
`  "B": 1` lost the space before the `%%{`, which made `B` a sibling of `A`
instead of its child.
