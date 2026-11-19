---
"prettier-plugin-mmd": patch
---

Remove the extra spaces after the keyword of a `gantt`, `journey`, `timeline`,
`sequence`, `venn`, or `c4` title that ends with a directive and spaces at once:
`title   A b  %%{z}%%  ` becomes `title A b %%{z}%%`, where the first formatting
left `title  A b %%{z}%%` and a second formatting removed the other space.
