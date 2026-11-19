---
"prettier-plugin-mmd": patch
---

Print the comment line, the directive, and the style that follow a U+2028 or
U+2029 and a comment in a `treemap` `classDef` one level inside the `classDef`,
so that formatting again changes nothing: `classDef zz\u2028%%{x}%% %% c` and a
row print `classDef zz` and the rest on lines indented by four spaces.
