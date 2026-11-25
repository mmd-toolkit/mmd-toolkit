---
"prettier-plugin-mmd": patch
---

Keep the directive on the line after a `timeline` event that ends in U+2028 and
a comment at the first column, where it is written: `%%{y}%%` is no longer
printed as `       %%{y}%%`.
