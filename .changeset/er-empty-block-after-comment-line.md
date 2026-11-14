---
"prettier-plugin-mmd": patch
---

Print the attribute block of an `erDiagram` entity after a comment line that
follows a line separator (U+2028 or U+2029) as any attribute block, so that `A`,
U+2028, `%% c`, ` {`, and `}` on the next line now ends with ` { }`. The text up
to the `{` is one line to mermaid.js, so it was kept as written, and the `}` and
the attributes were kept with it, which printed the same block in a different
form for each way of writing it. Now only that line stays as written, and the
`}` and the attributes below it are printed as in any other block.
