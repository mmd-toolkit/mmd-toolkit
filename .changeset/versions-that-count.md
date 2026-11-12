---
"prettier-plugin-mmd": patch
---

Decide what stays as written from ten versions of mermaid.js released in the 18
months before the one the formatter is checked with: `10.9.8`, `11.7.0`,
`11.8.1`, `11.13.0`, `11.14.0`, `11.15.0`, `11.16.1`, `11.17.2`, `12.0.0`, and
`12.3.0`. A form that one of them rejects or draws differently is left as
written, and a form that only an older version needs is no longer kept.
