---
"prettier-plugin-mmd": patch
---

Print a directive on the line after a comment line that follows a U+2028 or
U+2029 inside a `timeline` period at the start of its line, as it is written,
and not indented, so that formatting the file again changes nothing.
