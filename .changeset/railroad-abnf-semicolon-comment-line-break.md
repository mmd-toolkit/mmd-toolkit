---
"prettier-plugin-mmd": patch
---

Keep the space after the `;` of an ABNF `railroad-abnf-beta` comment when a
U+2028 that follows it becomes a line break, so that the output is accepted
again: `;`, a space, U+2028, `%% c`, an empty line, and `r=("x");` printed a
bare `;` that the second formatting rejected.
