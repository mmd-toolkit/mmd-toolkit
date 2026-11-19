---
"prettier-plugin-mmd": patch
---

Print a directive on the line after a comment line that follows a U+2028 or
U+2029 inside a `timeline` period where it is written, at the start of its line,
and not indented, so that formatting again changes nothing:
`: Google\u2028%% c`, a line feed, and `%%{y}%%` keep `%%{y}%%` at the first
column.
