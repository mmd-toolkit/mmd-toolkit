---
"prettier-plugin-mmd": patch
---

Print the text of an `ishikawa` node, and the `accTitle:` and `accDescr:` lines
of a `usecase` diagram, that hold a `;` or a directive before a last directive
that spaces follow, at once: `A;  b  %%{z}%%  ` in an `ishikawa` node becomes
`A; b %%{z}%%`, where the first formatting kept `A;  b  %%{z}%%` and a second
formatting collapsed it.
