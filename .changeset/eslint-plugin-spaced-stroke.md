---
"@mmd-toolkit/eslint-plugin": minor
---

Add `flowchart-no-spaced-stroke` and `agentflow-no-spaced-stroke`, which report
whitespace before the `:` of a `stroke` style (`linkStyle 0 stroke :#f00`), a
form that the mermaid.js documentation does not show and that mermaid.js does
not read for the colour of an arrowhead. They remove the whitespace with a fix
unless that would give a link's arrowhead and line different colours, and they
are not in `recommended`.
