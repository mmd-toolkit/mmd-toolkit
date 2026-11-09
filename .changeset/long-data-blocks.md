---
"prettier-plugin-mmd": minor
---

Print the `@{ ... }` block of a flowchart, agentflow or kanban node on lines of
its own, one entry on each line, when the block is on one line that is longer
than `printWidth`. A one-line
`A@{ shape: rect, label: "A process step with a long label", pos: "t", h: 60, constraint: "on" }`
becomes:

```mmd
A@{
  shape: rect
  label: "A process step with a long label"
  pos: "t"
  h: 60
  constraint: "on"
}
```
