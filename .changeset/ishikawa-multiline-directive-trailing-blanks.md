---
"prettier-plugin-mmd": patch
---

Print the text of an `ishikawa` node, and the `accTitle:` and `accDescr:` lines
of a `usecase` diagram, the same the first time you format them when they end
with a directive that spans several lines or holds a `;` and a space or a tab
follows it, where the runs of spaces stayed until the second time:
`A  b %%{init: {`, a line break, `}}%%`, and a space is now printed
`A b %%{init: {`, a line break, and `}}%%`.
