---
"prettier-plugin-mmd": patch
---

Keep the body of a `treeView` as written where redrawing the branches would give
a branch to a node that ends at a U+2028 or U+2029 that a comment follows, so
that formatting the file again changes nothing: `├── a`, `b`, the character,
`%% c`, a blank line, and `└── c` stay as they are.
