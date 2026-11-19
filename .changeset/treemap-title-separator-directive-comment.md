---
"prettier-plugin-mmd": patch
---

Print the directive and the comment after a U+2028 or U+2029 in a `treemap`
`title` or `accTitle:` line touching each other the first time, as the second
formatting already did: `title T`, a space, U+2028, a space, `%%{x}%%`, two
spaces, `%% c`, a blank line, and a row printed `%%{x}%% %% c` and now print
`%%{x}%%%% c`.
