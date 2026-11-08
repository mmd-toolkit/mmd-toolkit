---
"prettier-plugin-mmd": minor
---

Print the spellings that mermaid.js reads the same and draws the same in the
form that the examples in its documentation use at least twice as often as any
other. A keyword is printed in the case of the examples (`PARTICIPANT A` becomes
`participant A`, `CLASSDEF` becomes `classDef`), a string between `'` is printed
between `"` in the ten diagram types that read both (`'a'` becomes `"a"`), a
number of a pie chart, an xychart, a treemap, a radar chart, and a Venn diagram
is printed in the shortest form (`1.50` becomes `1.5`), the header `block-beta`,
`graph`, `packet-beta`, `sankey-beta`, and `xychart-beta` becomes `block`,
`flowchart`, `packet`, `sankey`, and `xychart`, `ishikawa` and `treemap` become
`ishikawa-beta` and `treemap-beta`, the direction `TB` of a flowchart header
becomes `TD`, and the direction `TD` of an agentflow or swimlane header becomes
`TB`. In a gitGraph, the colon after the header is removed, and `switch` becomes
`checkout`. A spelling that the examples do not use in one form, or that changes
what mermaid.js reads, stays as written, and so do the `direction` statements.
The option `singleQuote` has no effect on these strings.
