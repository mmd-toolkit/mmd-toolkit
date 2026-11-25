---
"prettier-plugin-mmd": patch
---

Print the text of an `ishikawa` node, and the `accTitle:` and `accDescr:` lines
of a `usecase` diagram, with one space before the last directive where the text
before it holds a `;` or a directive and spaces follow that directive, so that
formatting the file again changes nothing: `A;  b  %%{z}%%  ` in an `ishikawa`
node becomes `A; b %%{z}%%`.
