---
"prettier-plugin-mmd": minor
---

Omit the optional colon from a `gitGraph` header with no direction: `gitGraph:`
becomes `gitGraph`. Before, since 0.6.0, the colon stayed as written because an
older version of mermaid.js required it, so the same diagram came out in two
forms that draw the same figure. Now the colon is left out where it is optional,
while a header with a directive keeps the colon that mermaid.js 10.9.8 requires.
