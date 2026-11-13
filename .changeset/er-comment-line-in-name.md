---
"@mmd-toolkit/parser": patch
---

Fix `parse()` throwing
`mmd-toolkit parser bug: the comment region at 12 cuts the Identifier token at 10`
on an `erDiagram` where a comment line follows the U+2028 or U+2029 inside a
name. `A`, U+2028, a line `%% c`, and a line `Bar` is now the one entity `A`,
U+2028, `Bar`, as mermaid.js reads it.
