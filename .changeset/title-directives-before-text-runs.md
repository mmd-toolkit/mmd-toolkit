---
"prettier-plugin-mmd": patch
---

Print a `gantt`, `journey`, `timeline`, or `sequence` title that directives
precede with no space between the last directive and the text, so that
formatting the file again changes nothing: `title %%{x}%% %%{y}%%  A b` becomes
`title %%{x}%%%%{y}%%A b`. A `gantt`, `journey`, or `timeline` title also prints
the spaces between its words as one space.
