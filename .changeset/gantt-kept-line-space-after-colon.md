---
"prettier-plugin-mmd": patch
---

Keep one whitespace character after the `:` of a `gantt` task without data at
the end of a line that is kept as written: `accDescr {style:#x} A;: ` lost it,
and mermaid.js rejected the output.
