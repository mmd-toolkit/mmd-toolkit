---
"prettier-plugin-mmd": patch
---

Print the `end` of an inner `subgraph` or `flow` on a line of its own when only
the `end` of the block around it follows it, so that formatting the file again
changes nothing: `flow F; flow G; A[x;] --> B; end end` printed the inner `end`
on the line of `B;` and moved it on the second formatting.
