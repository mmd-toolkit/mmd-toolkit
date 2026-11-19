---
"prettier-plugin-mmd": patch
---

Print the title of a `gantt`, `journey`, `timeline`, `sequence`, `venn`, or `c4`
diagram, the `accTitle:` and `accDescr:` lines of a `usecase` diagram, and the
text of an `ishikawa` node the same the first time you format them as the second
time, where they differed: when directives that whitespace separates stand
before the text, when extra spaces stand before it, or when the text holds a
`;`, a directive, or a line separator and directives end the line.
`title %%{x}%% %%{y}%% A  b` in a `gantt` chart is now printed
`title %%{x}%%%%{y}%%A b` at once.
