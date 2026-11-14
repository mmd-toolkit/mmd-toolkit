---
"prettier-plugin-mmd": patch
---

Fix the `}` of an empty attribute block that follows a comment line after a line
separator (U+2028 or U+2029) in an `erDiagram`: it stayed on a line of its own,
and now joins the `{`, as in any empty block. For example, `A`, U+2028, `%% c`,
` {`, and `}` on the next line now ends with ` { }`.
