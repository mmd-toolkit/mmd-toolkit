---
"prettier-plugin-mmd": minor
---

Print the labels of `flowchart` and `swimlane-beta` diagrams without quotes and
the labels of shapes and the titles of flows of `agentflow-beta` diagrams in
quotes, as the documentation of mermaid.js writes them: `A["Start here"]`
becomes `A[Start here]` in a `flowchart`, and `A[Start]` becomes `A["Start"]` in
an `agentflow-beta`. Before, since 0.8.0, a label stayed as written, because
mermaid.js keeps another internal type for a label in quotes, so the same label
came out in two forms although it draws them the same. Now a label is printed in
the form of the examples, and a label that needs its quotes, such as one with a
bracket, keeps them.
