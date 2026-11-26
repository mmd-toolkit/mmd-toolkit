---
"@mmd-toolkit/spec": patch
---

Cite fixtures of `accDescr {a} %% c` in `erDiagram`, `flowchart`, and
`swimlane-beta`, which are rejected, and of `accDescr {a} %%` in `flowchart` and
`swimlane-beta`, which are accepted: in the comments of `diagrams/er.md`, where
a `%%` after a unit is no comment, and at the id run of `diagrams/flowchart.md`,
where the `%%` is the vertex `%%` and a `c` after it is a second vertex on the
same line.
