---
"prettier-plugin-mmd": minor
---

Print a text in the form that the documentation of mermaid.js uses, where both
forms are read the same, in a `sankey` link, in an `er` diagram, in a
`requirementDiagram`, in a Wardley map, in a `gitGraph`, in a `quadrantChart`,
in an `xychart`, in a `venn` diagram, in a `usecase-beta` diagram, and in an
`architecture-beta`, a `mindmap`, a `kanban`, a C4, a `flowchart`, and an
`agentflow-beta` diagram: `"a b",c,"1.0"` becomes `a b,c,1`,
`"CUSTOMER" ||--o{ "ORDER" : "places"` becomes `CUSTOMER ||--o{ ORDER : places`,
`branch "dev"` becomes `branch dev`, `quadrant-1 "A"` becomes `quadrant-1 A`,
`x-axis ["a", "b"]` becomes `x-axis [a, b]`, `set "A"[Alpha]` becomes
`set A["Alpha"]`, `actor "Alice"` becomes `actor Alice`, `a["x y"]` becomes
`a[x y]`, `Rel("a", "b", "Uses")` becomes `Rel(a, b, "Uses")`,
`subgraph "Group A"` becomes `subgraph Group A`, and the other way,
`Login(Log in)` becomes `Login("Log in")`, `Person(a, Alice,)` becomes
`Person(a, "Alice",)`, `connector C [Merge results]` becomes
`connector C["Merge results"]`, `accelerator Market` becomes
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
inside it, and a text that a `#` or a `%` follows once the spaces, tabs, and
directives after it are taken away. The numbers of the examples are:

- `sankey`: the source of a link 87 / 0, the target 83 / 4, the value 87 / 0.
- `er`: the name of an entity 39 / 2, the role of a relationship 43 / 2, the
  left name and the right name of a relationship 45 / 0 each, the id of a
  subgraph 11 / 1.
- `requirementDiagram`: the name of a requirement 15 / 1, the name of an element
  10 / 0, the id of a requirement 16 / 0, the text of a requirement 13 / 3, the
  type of an element 9 / 1, the docRef of an element 2 / 0, the left name and
  the right name of a relationship 14 / 0 each, a class and the names of `style`
  9 / 0.
- Wardley map: the name of a component 46 / 7, of an anchor 5 / 0, of a link 50
  / 12, of an evolve or a pipeline 5 / 2, of a stage of an evolution 20 / 0; the
  name of an accelerator or a deaccelerator 0 / 4 and of a pipeline component 0
  / 4, which go into quotes.
- `gitGraph`: the name of a branch 84 / 0, the branch of a checkout or a switch
  160 / 0, the branch of a merge 49 / 0.
- `quadrantChart`: the text of an x-axis 6 / 0, the start of a y-axis 3 / 0, the
  end of a y-axis 2 / 1, the text of a quadrant 12 / 0, the name of a point 12
  / 0.
- `xychart`: the title of a chart 0 / 8, of an x axis 0 / 2, of a y axis 0 / 8,
  of a line 0 / 3, which go into quotes; a category 38 / 17.
- `venn`: the name of a set 50 / 0, the id of a text without targets 6 / 0, the
  target of a style 4 / 0, the value of a style property 3 / 0; the label of a
  set or a union 0 / 22 and of a text without targets 0 / 6, which go into
  quotes.
- `usecase-beta`: the name of an actor 21 / 0, of a use case 8 / 1, the source
  and the target of a relationship 66 / 0 each, the name of a system boundary 7
  / 2, the target of a metadata update 4 / 0, the key of a metadata property 16
  / 0, the type of an actor, a boundary, or an update 7 / 0, the animation of an
  edge 2 / 0, the label of a use case between square brackets 6 / 0; the label
  of an actor between parentheses 1 / 12, of a use case 1 / 27, the title of a
  system boundary with an id 0 / 2, the label of a split association 1 / 3, of a
  note 0 / 1, and the icon of an actor 0 / 2, which go into quotes.
- `architecture-beta`: the label of a group 6 / 0 and of a service 30 / 0;
  `mindmap`: the text of a shape 21 / 0; `kanban`: the text of a shape 19 / 0.
  The names of a `treeView` stay as written: the examples write 58 without
  quotes and 8 in quotes, but the versions before 11.16.0 read a name in quotes
  only.
- C4: the alias of an element or a boundary 73 / 0, the source and the target of
  a relationship 35 / 0 each, the alias of an element in an update 2 / 0, the
  source and the target of a relationship in an update 31 / 0 each; the label 1
  / 107, the technology 0 / 43, the type of a boundary or a node 0 / 14, and the
  description of an element 0 / 46, which go into quotes. The description of a
  node and of a relationship and the arguments of `RelIndex` stay as written:
  the examples never write them.
- `flowchart` and `agentflow-beta`: the name of a subgraph 53 / 1, of a flow 17
  / 0, and of a connector 2 / 0; the title of a connector 0 / 2, which goes into
  quotes. The titles and the labels of a flowchart and an agentflow diagram stay
  as written, since `A["x"]` and `A[x]` have another `labelType` in mermaid.js,
  and so do the texts of a `sequenceDiagram`, a `classDiagram`, and an
  `eventmodeling`: a quote there is a character of the text, or the text is
  rejected without it.
