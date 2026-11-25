---
"prettier-plugin-mmd": patch
---

Print a comment that follows a U+2028 or U+2029 as written on a line that holds
a `;`, in a `kanban`, `treemap`, `treeView`, `pie`, `info`, `gitGraph`,
`packet`, `architecture`, `radar`, `wardley`, `railroad`, or `cynefin` diagram:
`title T;`, U+2028, `%% c`, and an empty line failed with
`a line break within a kept line` and are now printed as written.
