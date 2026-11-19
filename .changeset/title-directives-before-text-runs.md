---
"prettier-plugin-mmd": patch
---

Print the runs of spaces in a `gantt`, `journey`, or `timeline` title that has
directives before its text as one space at once: `title %%{x}%% %%{y}%% A  b`
becomes `title %%{x}%%%%{y}%%A b`, where the first formatting kept `A  b` and a
second formatting collapsed it.
