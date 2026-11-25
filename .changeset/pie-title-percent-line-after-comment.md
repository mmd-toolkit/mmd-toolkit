---
"prettier-plugin-mmd": patch
---

Keep a line of `%%` that follows a comment after U+2028 or U+2029 on a `pie`
`title`, `accTitle:`, or `accDescr:` line, and on a `gitGraph` `accTitle:` or
`accDescr:` line, as written, so that older versions of mermaid.js draw the text
as it was written: `title`, U+2028, `%%{x}%%%% c`, and a line `%%` were printed
with `%%{x}%%%% c` on a line of its own, and are now printed as written.
