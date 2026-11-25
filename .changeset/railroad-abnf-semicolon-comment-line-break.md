---
"prettier-plugin-mmd": patch
---

Keep the whitespace after the `;` of an ABNF comment when a U+2028 or U+2029
after it becomes a line break, so that the output is accepted again. In
`railroad-abnf-beta`, `;`, a space, U+2028, and `%% c` were printed as `;` and
`%% c` on two lines, which the second formatting rejected as a bare `;`, and are
now printed as `; ` and `%% c`.
