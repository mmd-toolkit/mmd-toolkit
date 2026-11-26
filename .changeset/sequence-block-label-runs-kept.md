---
"prettier-plugin-mmd": patch
---

Keep a run of two or more spaces in the label of a `loop`, `alt`, `else`, `opt`,
`par`, `par_over`, `and`, `critical`, `option`, or `break` of a `sequence`
diagram as written: `loop A  b` stays, where 0.6.0 began to print it `loop A b`.
That printed every run of spaces in these labels as one space, as mermaid.js
draws them, but mermaid.js 10.9.8 stops with an error on a label with such a run
and draws the one-space label, so formatting changed what it draws. Now only
such a run stays, and the other runs are still printed as one space, such as a
tab between two words.
