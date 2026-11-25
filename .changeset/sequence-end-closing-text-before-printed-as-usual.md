---
"prettier-plugin-mmd": patch
---

Print the text before an `end` that goes to a line of its own as it is printed
anywhere else, so that formatting the file again changes nothing.
`loop style:#x;; loop x; A->>B: body; end #;  %% c` printed `A->>B` as written
and `A ->> B` on the second formatting, and now prints `A ->> B` at once.
