---
"prettier-plugin-mmd": minor
---

Print a run of spaces and tabs inside a title, an `accDescr`, and the labels
that mermaid.js draws as SVG text (the texts of a C4 statement, the strings of a
`railroad` diagram, and others) as one space: `title Sales   report` becomes
`title Sales report`, and `quadrant-1 a    b` becomes `quadrant-1 a b`. These
keep their runs: the labels that it draws as HTML (the nodes and edges of
`flowchart` and `agentflow`, the descriptions, transitions, and notes of
`stateDiagram`, the nodes of `mindmap`, the cards of `kanban`, the labels of a
`class` relation, and every text of `usecase`), the title of a subgraph or a
`flow` that wraps (a markdown title, a group with a data block, a `swimlane`
lane), an `accTitle`, the arguments of a C4 statement that are not a label, a
technology, a type, or a description, the names that other statements refer to,
a text of spaces and tabs only that is not a string, a text over several lines
or with a comment, a directive, or a U+2028 or U+2029, and a text with a `<` or
in a diagram that holds `white-space`.
