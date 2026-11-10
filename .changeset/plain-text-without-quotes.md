---
"prettier-plugin-mmd": minor
---

Print a text in the form that the documentation of mermaid.js uses, where both
forms are read the same, in a `sankey` link, in an `er` diagram, in a
`requirementDiagram`, in a Wardley map, in a `gitGraph`, in a `quadrantChart`,
in an `xychart`, and in a `venn` diagram: `"a b",c,"1.0"` becomes `a b,c,1`,
`"CUSTOMER" ||--o{ "ORDER" : "places"` becomes `CUSTOMER ||--o{ ORDER : places`,
`branch "dev"` becomes `branch dev`, `quadrant-1 "A"` becomes `quadrant-1 A`,
`x-axis ["a", "b"]` becomes `x-axis [a, b]`, `set "A"[Alpha]` becomes
`set A["Alpha"]`, and the other way, `accelerator Market` becomes
`accelerator "Market"` and `title Sales` becomes `title "Sales"`. Before, the
formatter printed the quotes as written, because a string can hold what a word
without quotes cannot (a comma, a line break, a keyword, a space where the
diagram type drops it); so one name was printed in two forms depending on how
its author wrote it, although mermaid.js reads both forms the same and its
documentation writes each of these texts in one of them. The form of a field is
the one that its examples use at least twice as often as the other (without
quotes / in quotes), and the quotes stay on every text for which the other form
would be read otherwise: a text with a comma, a doubled quote, a line break, or
a `%%`, a word that is a keyword of the diagram type (`"end"`, `"one"`,
`"commit"`, `"line"`), a name with a space or a `-` where the diagram type does
not read it, a text of several words in an `xychart`, a string with a directive
inside it, and a text that touches a `#`, a `%`, a `;`, or a `:`. The numbers of
the examples are:

- `sankey`: the source of a link 87 / 0, the target 83 / 4, the value 87 / 0.
- `er`: the name of an entity 39 / 2, the role of a relationship 43 / 2, the
  left name and the right name of a relationship 45 / 0 each, the id of a
  subgraph 11 / 1.
- `requirementDiagram`: the name of a requirement 15 / 1, the name of an element
  10 / 0, the id of a requirement 16 / 0, the text of a requirement 13 / 3, the
  type of an element 9 / 1, the docRef of an element 2 / 0, the names of a
  relationship 14 / 0, a class and the names of `style` 9 / 0.
- Wardley map: the name of a component 46 / 7, of an anchor 5 / 0, of a link 50
  / 12, of an evolve or a pipeline 5 / 2, of a stage of an evolution 20 / 0; the
  name of an accelerator or a deaccelerator 0 / 4 and of a pipeline component 0
  / 4, which go into quotes.
- `gitGraph`: the name of a branch 85 / 0, the branch of a checkout or a switch
  161 / 0, the branch of a merge 50 / 0.
- `quadrantChart`: the text of an x-axis 4 / 0, the start of a y-axis 2 / 0, the
  text of a quadrant 8 / 0, the name of a point 6 / 0.
- `xychart`: the title of a chart 0 / 8, of an x axis 0 / 2, of a y axis 0 / 8,
  of a line 0 / 3, which go into quotes; a category 38 / 17.
- `venn`: the name of a set 50 / 0, the id of a text without targets 6 / 0, the
  target of a style 4 / 0, the value of a style property 3 / 0; the label of a
  set or a union 0 / 22 and of a text without targets 0 / 6, which go into
  quotes.
