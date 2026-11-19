---
"prettier-plugin-mmd": patch
---

Fix the error `a line break within a kept line` on a treemap `title`,
`accTitle`, `accDescr` line, or `classDef` that a U+2028 or U+2029 and a comment
ending in `;` follow, such as `classDef zz color:red`, U+2028, U+2029, and
`%% d;`: the line is now printed as written.
