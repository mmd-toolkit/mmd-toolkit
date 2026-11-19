---
"prettier-plugin-mmd": patch
---

Print the text before a comment line that follows a U+2028 or U+2029 as it is
printed without the `;` at the end of the text, so that formatting a `flowchart`
again changes nothing: `B --> C;;`, the character, `%% c`, an empty line, and a
line of `;` print `B --> C` and `%% c` on separate lines.
