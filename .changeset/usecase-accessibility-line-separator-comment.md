---
"prettier-plugin-mmd": patch
---

Print the one-line `accTitle:` or `accDescr:` of a `usecase` diagram as any such
line when a U+2028 or U+2029 and a comment line follow its text, so that
formatting again changes nothing: `accTitle  :   T`, the character, `%% c`, and
an empty line now print `accTitle: T`, `%% c`, and an empty line on separate
lines.
