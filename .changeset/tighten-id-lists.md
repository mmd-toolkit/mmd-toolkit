---
"prettier-plugin-mmd": minor
---

Print the ids of a `state` `class` statement and the names of a `class` diagram
`classDef` statement without whitespace around their commas: `class A, B c` now
prints as `class A,B c`. In `state`, whitespace before a comma ends the ids, so
it stays as written.
