---
"prettier-plugin-mmd": patch
---

Print the title of a `gantt`, `journey`, `timeline`, `sequence`, `venn`, or `c4`
diagram, the `accTitle:` and `accDescr:` lines of a `usecase` diagram, and the
text of an `ishikawa` node the same the first time you format them as the second
time, where the second time changed them. `title %%{x}%% %%{y}%% A  b` in a
`gantt` chart is now printed `title %%{x}%%%%{y}%%A b` at once, where the first
formatting kept `A  b`.
