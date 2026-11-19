---
"prettier-plugin-mmd": patch
---

Keep a `pie` title as written, up to a line of `%%`, where the title ends at a
U+2028 or U+2029 that a comment follows, so that the printed file draws as the
written one in mermaid.js 10.9.8: `title`, the character, `%%{x}%%%% c`, and a
line of `%%` are no longer printed with the title bare and the comment and the
`%%` on lines of their own.
