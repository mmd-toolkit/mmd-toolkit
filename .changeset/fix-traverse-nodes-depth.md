---
"@mmd-toolkit/parser": patch
---

Walk deeply nested trees with `traverseNodes()`. It threw a `RangeError` on
trees nested thousands deep, which `parse()` returns and mermaid.js accepts.
