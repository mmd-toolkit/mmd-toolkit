---
"prettier-plugin-mmd": minor
---

Print the arguments of a `click` call in `flowchart`, `agentflow`, `class` and
`gantt` without whitespace at their ends or before a `,`, and with one space
after it: `click A call f(  "x" ,y )` becomes `click A call f("x", y)`.
mermaid.js splits the arguments at the `,` outside quotes and trims each part,
so the function is called with the same arguments. The whitespace inside quotes
stays. Where the line holds `style` or `classDef`, a `:`, a `#`, and a `;` in
this order, whether whitespace stands between that `:` and the last `#` stays as
written: `click A call f(style:x,#b;c)` is unchanged, since mermaid.js drops the
last `;` of such a line, and a space after the `,` would change which one.
