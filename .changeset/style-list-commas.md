---
"prettier-plugin-mmd": minor
---

Print the styles of `style`, `classDef` and `linkStyle` in `flowchart`,
`agentflow`, `class`, `state` and `block` as `ER` and `requirement` print them,
with one space after the first `:` of a style and after each `,`, and none
before them: `style A fill:#f9f,stroke:#333` becomes
`style A fill: #f9f, stroke: #333`. mermaid.js draws both the same. The space
after a `,` before a `fill` style of a numbered `linkStyle` keeps whether it is
there, since mermaid.js adds `fill:none` to that link when no style starts with
`fill`. In `flowchart` and `agentflow`, a `linkStyle` and a `classDef`, which
can reach a link, keep whether whitespace stands between `stroke` and its `:`,
and a `linkStyle` keeps a `stroke:` with a value of whitespace only, since
mermaid.js colours the arrowheads of a link only from a `stroke:` with a value;
and a space between a backslash and a `,` of a `classDef` stays, since `\,` is a
`,` in its style.
