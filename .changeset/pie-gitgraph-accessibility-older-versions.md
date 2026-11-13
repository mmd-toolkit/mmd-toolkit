---
"prettier-plugin-mmd": patch
---

Keep a `pie` or `gitGraph` line as written where mermaid.js 10.9.8 reads it as
the title or the description: the line after an empty `accTitle:` or
`accDescr:`, and the whitespace before a `%%` after an `accTitle:` value.
`"A":1` after an empty `accTitle:` was printed `"A": 1`, which changed the title
that 10.9.8 draws, and `accDescr {a} %% c` was printed `accDescr: a %% c`.
