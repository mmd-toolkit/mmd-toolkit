---
"prettier-plugin-mmd": patch
---

Fix excess indentation when the first body line of an `eventmodeling` data or
note block is deeper than later lines. Later lines now follow the authored
indentation changes without moving outside the body margin.
