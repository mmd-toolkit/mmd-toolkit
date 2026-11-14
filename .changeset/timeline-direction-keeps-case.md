---
"prettier-plugin-mmd": patch
---

Keep the direction `td` of a `timeline` header in lower case: `timeline td` no
longer becomes `timeline TD`. Version 0.6.0 began to print it as `TD`, as the
examples in the documentation of mermaid.js write it, but mermaid.js 10.9.8 and
11.7.0 read the word as the text of a period, so that text changed in the
diagram that they draw once the text was formatted. Now the direction stays as
written.
