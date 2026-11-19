---
"prettier-plugin-mmd": patch
---

Print the text of a one-line `accTitle:` or `accDescr:` in a `usecase` diagram
as the text of any such line when a U+2028 or U+2029 and a comment line follow
it, so that formatting the file again changes nothing: `accTitle  :   T`, the
character, `%% c`, and an empty line print `accTitle: T`, `%% c`, and an empty
line on separate lines.
