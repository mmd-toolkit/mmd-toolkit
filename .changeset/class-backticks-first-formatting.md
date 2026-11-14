---
"prettier-plugin-mmd": patch
---

Fix a `classDiagram` name in backticks that lost them only at a second
formatting: ``class `Alpha` {Word %% c}`` kept its backticks at the first
formatting and lost them at the second, and now loses them at the first.
