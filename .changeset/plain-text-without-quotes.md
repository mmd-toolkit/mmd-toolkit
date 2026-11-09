---
"prettier-plugin-mmd": minor
---

Print a text without quotes when it is plain, in a `sankey` link, in the names,
roles, and subgraph ids of an `er` diagram, in the names, values, and classes of
a `requirementDiagram`, in the names of a Wardley map, and in the branches of a
`gitGraph`: `"a b",c,"1.0"` becomes `a b,c,1`,
`"CUSTOMER" ||--o{ "ORDER" : "places"` becomes `CUSTOMER ||--o{ ORDER : places`,
and `branch "dev"` becomes `branch dev`. The name of a Wardley `accelerator`,
`deaccelerator`, and pipeline component goes the other way, into quotes:
`accelerator Market` becomes `accelerator "Market"`. Before, the formatter
printed the quotes as written, so one name was printed in two forms depending on
how its author wrote it, although mermaid.js reads both forms the same and its
documentation writes each of these texts in one of them. A text stays as it is
when the other form would be read otherwise: a text with a comma, a doubled
quote, a line break, or a `%%`, a word that is a keyword of the diagram type
(`"end"`, `"one"`, `"commit"`), a name with a space or a `-` where the diagram
type does not read it, a string with a directive inside it, and a text that
touches a `#`, a `%`, a `;`, or a `:`.
