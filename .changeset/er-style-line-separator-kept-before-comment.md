---
"prettier-plugin-mmd": patch
---

Keep a U+2028 or U+2029 that a comment or a directive follows on its line in an
ER `style` or `classDef`: `style A fill:red`, a U+2028, a U+2029, and `%% d` is
printed as written, where it came out as `style A fill: red` and `%% d` on a
line of its own. 0.9.0 began to drop the character there, because mermaid.js
draws the same picture without it, but the formatted text no longer drew the
same SVG as the written text. Now the character stays, as 0.5.0 printed it, and
it is still dropped where only whitespace follows it on its line, such as
`style A fill:red` and a U+2028 at the end of a line.
