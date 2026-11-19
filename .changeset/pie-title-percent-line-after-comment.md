---
"prettier-plugin-mmd": patch
---

Keep the `title`, `accTitle:`, or `accDescr:` line of a `pie` chart, and the
`accTitle:` or `accDescr:` line of a `gitGraph`, as written up to a line of `%%`
that follows a comment after a U+2028 or U+2029, so that it draws as written in
the oldest mermaid.js that counts: `accTitle: T\u2028%%{x}%%%% c` followed by a
line `%%` no longer gets the comment and the `%%` on lines of their own.
