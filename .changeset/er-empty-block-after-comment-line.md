---
"prettier-plugin-mmd": patch
---

Print the attribute block of an `erDiagram` entity over several lines as any
attribute block also on a line that stays as written, after an entity `1` that
touches a letter, after a comment line that follows U+2028 or U+2029, after a
directive that is not closed, and the like: `1A {`, a line break, and `}` now
becomes `1A { }`. Before, the `}` of an empty block stayed as written there, and
so did the block of an entity that stood later on a line that a comment line
joined, so an empty block written over several lines stayed over several lines,
although it is ` { }` everywhere else. Now the `}` and the attributes below the
`{` line stand as in any other block, what stands before the `{` stays as
written on a line that a comment line joined and is formatted as usual on the
other lines, and a block over several lines stays as written only where its `}`
itself stands on a line that stays as written.
