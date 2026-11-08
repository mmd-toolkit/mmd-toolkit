---
"prettier-plugin-mmd": minor
---

Print the styles of `style`, `classDef` and `linkStyle` in `flowchart`,
`agentflow`, `class`, `state` and `block` as `ER` and `requirement` print them,
with one space after the first `:` of a style and after each `,`, and none
before them: `style A fill:#f9f,stroke:#333` becomes
`style A fill: #f9f, stroke: #333`. The spacing stays as written where
whitespace decides what mermaid.js reads: whether a space follows the `,` before
a `fill` or a `stroke:` style of a `linkStyle`, and a `stroke:` with no value
there, the whitespace between `stroke` and its `:` in a `classDef` or a
`linkStyle` of `flowchart` and `agentflow`, a backslash in a style, and the
`color:` and `text-align:` of a `block` `style`.
