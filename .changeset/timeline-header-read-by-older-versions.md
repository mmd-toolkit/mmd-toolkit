---
"prettier-plugin-mmd": patch
---

Keep the text after the direction of a `timeline`, and a description block that
starts on that line with what follows it, on the header line:
`timeline TD title T` was printed as `timeline TD` and `title T` on two lines,
which mermaid.js 10.9.8 and 11.7.0 draw as a different period.
