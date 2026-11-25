---
"prettier-plugin-mmd": patch
---

Print a `requirement` statement that a comment line after U+2028 or U+2029 cuts
as written to its end, so that mermaid.js accepts the formatted text. `element`,
U+2028, `%% c`, an empty line, `"e"`, and `:::c {` on the next line printed the
name without quotes, as `e ` with `:::c {` after it, which the second formatting
rejected, and now keep the quotes as written.
