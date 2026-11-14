# 最小の図（rule-ideas）

固定版の mermaid.js は次の図を受理する【実行】。
括弧内は、mermaid が返す図種の id。

- `sequenceDiagram`、改行、`A->>B: hi`（sequence）
- `classDiagram`、改行、`class A`（classDiagram）
- `stateDiagram-v2`、改行、`[*] --> A`（stateDiagram）
- `erDiagram`、改行、`A ||--o{ B : has`（er）
- `gantt`、改行、`title T`、改行、`section S`、改行、
  `Task :a1, 2024-01-01, 1d`（gantt）
- `pie`、改行、`"a" : 1`（pie）
- `journey`、改行、`title T`、改行、`section S`、改行、`Task: 5: Me`（journey）
- `gitGraph`、改行、`commit`（gitGraph）
- `mindmap`、改行、`root`、改行、`  A`（mindmap）
- `timeline`、改行、`title T`、改行、`2020 : a`（timeline）
- `quadrantChart`、改行、`x-axis Low --> High`（quadrantChart）
- `requirementDiagram`、改行、`requirement r {`、改行、`id: 1`、改行、
  `}`（requirement）
- `block`、改行、`A`（block）
- `xychart`、改行、`x-axis [a, b]`、改行、`bar [1, 2]`（xychart）
- `sankey`、改行、`A,B,1`（sankey）
- `packet`、改行、`0-15: "A"`（packet）
- `kanban`、改行、`todo`、改行、`  a`（kanban）
- `architecture-beta`、改行、`service a(server)[A]`（architecture）
- `C4Context`、改行、`Person(a, "A")`（c4）
- `radar-beta`、改行、`axis a, b, c`、改行、`curve c1{1,2,3}`（radar）
- `treemap-beta`、改行、`"A"`、改行、`  "B": 1`（treemap）
- `info`（info）
