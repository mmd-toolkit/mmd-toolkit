# The smallest diagrams (rule-ideas)

The pinned mermaid.js accepts these (run; in parentheses, the diagram type id it
returns):

- `sequenceDiagram`, a line break, `A->>B: hi` (sequence)
- `classDiagram`, a line break, `class A` (classDiagram)
- `stateDiagram-v2`, a line break, `[*] --> A` (stateDiagram)
- `erDiagram`, a line break, `A ||--o{ B : has` (er)
- `gantt`, a line break, `title T`, a line break, `section S`, a line break,
  `Task :a1, 2024-01-01, 1d` (gantt)
- `pie`, a line break, `"a" : 1` (pie)
- `journey`, a line break, `title T`, a line break, `section S`, a line break,
  `Task: 5: Me` (journey)
- `gitGraph`, a line break, `commit` (gitGraph)
- `mindmap`, a line break, `root`, a line break, `  A` (mindmap)
- `timeline`, a line break, `title T`, a line break, `2020 : a` (timeline)
- `quadrantChart`, a line break, `x-axis Low --> High` (quadrantChart)
- `requirementDiagram`, a line break, `requirement r {`, a line break, `id: 1`,
  a line break, `}` (requirement)
- `block`, a line break, `A` (block)
- `xychart`, a line break, `x-axis [a, b]`, a line break, `bar [1, 2]` (xychart)
- `sankey`, a line break, `A,B,1` (sankey)
- `packet`, a line break, `0-15: "A"` (packet)
- `kanban`, a line break, `todo`, a line break, `  a` (kanban)
- `architecture-beta`, a line break, `service a(server)[A]` (architecture)
- `C4Context`, a line break, `Person(a, "A")` (c4)
- `radar-beta`, a line break, `axis a, b, c`, a line break, `curve c1{1,2,3}`
  (radar)
- `treemap-beta`, a line break, `"A"`, a line break, `  "B": 1` (treemap)
- `info` (info)
