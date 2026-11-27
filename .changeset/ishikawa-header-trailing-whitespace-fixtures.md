---
"@mmd-toolkit/spec": patch
---

Cite more fixtures of trailing whitespace after the `ishikawa` header, in Blank
lines of `diagrams/ishikawa.md` and in
`known-divergences/blank-line-after-header-or-comments.md`: an indented root,
two spaces, a CRLF, a CR, an empty line, a comment line, and a space after a
directive, which mermaid.js rejects, and a diagram comment or the end of the
text after the whitespace, which both accept.
