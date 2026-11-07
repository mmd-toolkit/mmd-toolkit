---
"mmdfmt": minor
---

Add `mmdfmt`, a command-line tool that formats Mermaid diagrams and nothing
else: `.mmd` and `.mermaid` files, and the `mermaid` and `mmd` code blocks of
Markdown files, whose other text stays byte for byte. It formats with Prettier
and `prettier-plugin-mmd`, so a project can format its diagrams without
formatting its Markdown with Prettier. It needs Node.js 22.13 or later.
