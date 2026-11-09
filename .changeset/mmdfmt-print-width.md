---
"mmdfmt": minor
---

Read `printWidth` of a Prettier configuration and `max_line_length` of
`.editorconfig`, so that a data block `@{ ... }` on one line is split and the
colons of a Gantt section are lined up as they are with Prettier and
`prettier-plugin-mmd`. In a code block in a list or a block quote, the width of
what stands before each line is taken off the line width.
