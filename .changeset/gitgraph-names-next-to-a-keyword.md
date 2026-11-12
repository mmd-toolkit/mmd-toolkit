---
"prettier-plugin-mmd": patch
---

Print `branch "commit-x"` as `branch commit-x` and `branch "Title"` as
`branch Title`: the quotes of a gitGraph name that only starts with a keyword,
or spells one in another case, were kept although every version of mermaid.js
that the formatter checks reads the name without them. A name that one of those
versions reads as a keyword, such as `"commit"`, `"Merge"`, `"lr-x"`, or
`"title1"`, keeps its quotes, and so does `"options"`, whose quotes were dropped
although mermaid.js 10.9.8 rejects the name without them.
