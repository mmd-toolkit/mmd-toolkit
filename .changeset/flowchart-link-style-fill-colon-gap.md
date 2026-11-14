---
"prettier-plugin-mmd": patch
---

Keep the space before the `:` of a `fill` in a `linkStyle` of a `flowchart` or a
`swimlane-beta`: `linkStyle 0 fill :red` was printed `linkStyle 0 fill: red`,
which draws the text of the link in another colour in mermaid.js 11.7.0, and in
every version for a `swimlane-beta`.
