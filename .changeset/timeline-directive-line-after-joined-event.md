---
"prettier-plugin-mmd": patch
---

Print a directive on the line after a comment line that follows a U+2028 or
U+2029 inside a `timeline` period at the start of its line, where it is written.
`: Google`, U+2028, `%% c`, a line feed, `%%{y}%%`, and `: Apple` on the next
line printed `%%{y}%%` at the indentation of the event, and now keep it at the
first column.
