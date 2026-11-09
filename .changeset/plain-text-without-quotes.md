---
"prettier-plugin-mmd": minor
---

Print a text without quotes when it is plain, in a `sankey` link, in the names,
roles, and subgraph ids of an `er` diagram, in the names, values, and classes of
a `requirementDiagram`, in the names of a Wardley map, in the branches of a
`gitGraph`, in the texts of a `quadrantChart`, and in the categories of an
`xychart`: `"a b",c,"1.0"` becomes `a b,c,1`,
`"CUSTOMER" ||--o{ "ORDER" : "places"` becomes `CUSTOMER ||--o{ ORDER : places`,
`branch "dev"` becomes `branch dev`, `quadrant-1 "A"` becomes `quadrant-1 A`,
and `x-axis ["a", "b"]` becomes `x-axis [a, b]`. The name of a Wardley
`accelerator`, `deaccelerator`, and pipeline component, and the title of an
`xychart`, of its axes, and of its `line`, go the other way, into quotes:
`accelerator Market` becomes `accelerator "Market"`, and `title Sales` becomes
`title "Sales"`. Before, the formatter printed the quotes as written, so one
name was printed in two forms depending on how its author wrote it, although
mermaid.js reads both forms the same and its documentation writes each of these
texts in one of them. A text stays as it is when the other form would be read
otherwise: a text with a comma, a doubled quote, a line break, or a `%%`, a word
that is a keyword of the diagram type (`"end"`, `"one"`, `"commit"`, `"line"`),
a name with a space or a `-` where the diagram type does not read it, a text of
several words in an `xychart`, a string with a directive inside it, and a text
that touches a `#`, a `%`, a `;`, or a `:`.
