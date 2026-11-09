---
"prettier-plugin-mmd": minor
---

Print a text without quotes when it is plain, in a `sankey` link and in the
names, roles, and subgraph ids of an `er` diagram: `"a b",c,"1.0"` becomes
`a b,c,1`, and `"CUSTOMER" ||--o{ "ORDER" : "places"` becomes
`CUSTOMER ||--o{ ORDER : places`. Before, the formatter printed the quotes as
written, so one id or value was printed in two forms depending on how its author
wrote it, although mermaid.js reads both forms the same and its documentation
writes these texts without quotes. A text stays in quotes when it is not plain,
such as a text with a comma, a doubled quote, a line break, or a `%%`, a word
that is a keyword of the diagram type (`"end"`, `"one"`), a name with a space or
a `-` in an `er` diagram, or a string with a directive inside it.
