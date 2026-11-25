---
"prettier-plugin-mmd": patch
---

Print the comment, the directive, and the row that follow a U+2028 or U+2029 and
a comment in a `treemap` `classDef` indented by four spaces. `classDef zz`,
U+2028, `%%{x}%% %% c`, an empty line, and `"A": 1` were printed with the
comment line and the row at the first column, and are now printed with both
indented by four spaces.
