---
"prettier-plugin-mmd": minor
---

Print the arguments of a `click` call in `flowchart`, `agentflow`, `class` and
`gantt` without whitespace at their ends or before a `,`, and with one space
after it: `click A call f(  "x" ,y )` becomes `click A call f("x", y)`.
mermaid.js splits the arguments at the `,` outside quotes and trims each part,
so the function is called with the same arguments. The whitespace inside quotes
stays. A gap that the line rule of mermaid.js may read keeps whether it holds
whitespace: `click A call f(style:x,#b;c)` stays as written, since a space after
the `,` would change the last `;` that the rule ignores and so the arguments.
