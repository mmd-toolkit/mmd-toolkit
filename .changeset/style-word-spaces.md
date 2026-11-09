---
"prettier-plugin-mmd": minor
---

Print a run of spaces or tabs between the words of a `style`, a `classDef`, or a
`linkStyle` as one space in flowchart, agentflow, class, state, block, usecase,
ER, and requirement diagrams, except where CSS reads it as part of the value
(inside a string, a comment, or `url(`): `style A fill   #f00` becomes
`style A fill #f00`, and `classDef c stroke-dasharray: 5    5` becomes
`classDef c stroke-dasharray: 5 5`.
