---
"prettier-plugin-mmd": patch
---

Print a directive on the line after a comment line that follows a U+2028 or
U+2029 inside a `timeline` period where it is written, at the start of its line,
so that formatting again changes nothing. `: Google`, U+2028, `%% c`, a line
feed, `%%{y}%%`, and `: Apple` on the next line printed `%%{y}%%` at the
indentation of the event and then with one space, and now keep it at the first
column.
