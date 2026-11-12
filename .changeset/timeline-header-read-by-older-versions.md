---
"prettier-plugin-mmd": patch
---

Fix three forms of `timeline` that older versions of mermaid.js drew differently
after formatting: `timeline td` was printed `timeline TD` and
`timeline TD title T` was split into two lines, which 10.9.8, 11.7.0, 11.8.1,
and 11.13.0 read as periods, and `title` followed by a line `# c` was joined
into `title # c`, which 10.9.8 reads as a period. Now a direction keeps its
case, the text after a direction stays on the line of the header, and that title
stays as written.
