---
"prettier-plugin-mmd": patch
---

Leave the quotes of a text as written where a line separator (U+2028 or U+2029)
and a comment after it join its line to the next one: in a `requirementDiagram`,
`element "b"`, a U+2028, and `%% c` above a line `{` was printed without the
quotes, and now stays as written.
