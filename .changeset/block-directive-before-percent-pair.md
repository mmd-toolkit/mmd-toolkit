---
"@mmd-toolkit/spec": patch
---

Say in Directives inside units of `diagrams/block.md` that a `%%` right after a
directive is the text of an id, so that `b%%{init: {}}%%%% x` is rejected as a
directive inside the id `b%%`, which mermaid.js reads as the blocks `b%%` and
`x`, while `b %%{init: {}}%%%% x` holds the id `%%` and a line
`%%{init: {}}%%%% x` is a comment line.
