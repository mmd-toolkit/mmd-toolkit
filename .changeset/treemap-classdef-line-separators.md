---
"prettier-plugin-mmd": patch
---

Fix the error `a line break within a kept line` on a treemap `classDef` whose
style is followed by two U+2028 or U+2029 and a `%%` comment, as in
`classDef zz color:red\u2028\u2029 %% d;` with the escapes read as the
characters: the line is now printed as written. A directive and a comment line
after such a style also keep the second character, as the other diagram types
do.
