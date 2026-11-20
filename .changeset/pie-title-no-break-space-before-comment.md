---
"prettier-plugin-mmd": patch
---

Print a no-break space or another whitespace character that is no space or tab
before a `%%` comment as written in the `title` of a pie chart and in an
`accDescr` line of a pie chart or a gitGraph. Up to 0.9.1, `title T`, a no-break
space, and `%% c` was printed `title T %% c`, which mermaid.js 10.9.8 draws as
another title; it is no longer changed. The spaces and tabs beside the character
are still printed as one space each.
