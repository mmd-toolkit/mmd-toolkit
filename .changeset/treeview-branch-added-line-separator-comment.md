---
"prettier-plugin-mmd": patch
---

Keep the body of a `treeView` as written where redrawing the branches would give
a branch to a node that ends at a U+2028 or U+2029 before a comment or a
directive, so that formatting again changes nothing and the drawing does not
change: `├── a`, `b\u2028%%{x}%%`, a blank line, and `└── c` stay as they are.
