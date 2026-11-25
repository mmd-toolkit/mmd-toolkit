---
"prettier-plugin-mmd": patch
---

Print the text before an `end` that goes to a line of its own in a `sequence`
diagram as it is printed anywhere else.
`loop style:#x;; loop x; A->>B: body; end #;  %% c` printed `A->>B` as written,
and `A ->> B` only on the second formatting; it now prints `A ->> B` at once.
