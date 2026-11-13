---
"prettier-plugin-mmd": patch
---

Print an `accDescr` block in the form with the colon also where its only line
break stands inside a directive: `accDescr {a %%{init:` followed by `{}}%% b}`
on the next line becomes `accDescr: a %%{init:` and `{}}%% b`, as mermaid.js
reads the description as one line.
