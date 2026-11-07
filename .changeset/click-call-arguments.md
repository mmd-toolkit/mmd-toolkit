---
"prettier-plugin-mmd": minor
---

Print the arguments of a `click` call in `flowchart`, `agentflow`, `class` and
`gantt` without whitespace at their ends or before a `,`, and with one space
after it: `click A call f(  "x" ,y )` becomes `click A call f("x", y)`.
mermaid.js splits the arguments at the `,` outside quotes and trims each part,
so the function is called with the same arguments. The whitespace inside quotes
stays.
