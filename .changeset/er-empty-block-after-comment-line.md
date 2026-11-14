---
"prettier-plugin-mmd": patch
---

Print an empty attribute block in an `erDiagram` as `{ }` after a comment line
that follows a line separator (U+2028 or U+2029): `A`, U+2028, `%% c`, ` {`, and
`}` on the next line now ends with ` { }`. Since 0.6.0, the `}` stayed where it
was written, so the same empty block was printed in a different form for each
way of writing it, unlike an empty block anywhere else. Now the `}` joins the
`{`, as in every empty block, and the rest of the line stays as written.
