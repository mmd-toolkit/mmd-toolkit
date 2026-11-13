---
"prettier-plugin-mmd": patch
---

Leave a comment line inside the parentheses of a color function of a `venn-beta`
style as it is written: the `)` in `%% ) x  y` between the lines of
`fill:rgb(1,` and `2,3)` ended the function early, and the runs in the comment
were joined.
