---
"prettier-plugin-mmd": patch
---

Print a `gantt`, `journey`, `timeline`, `sequence`, `venn`, or `c4` title, and
the `accDescription` of a `c4` diagram, that ends with a directive and spaces
with one space after the keyword, so that formatting the file again changes
nothing: `title   A b  %%{z}%%  ` becomes `title A b %%{z}%%`.
