---
"prettier-plugin-mmd": patch
---

Fix a `classDiagram` name in backticks that a line separator (U+2028 or U+2029)
and a comment follow: `` class `A_Car` `` kept its backticks at the first
formatting and lost them at the second, and now loses them at the first.
