---
"prettier-plugin-mmd": patch
---

Keep one whitespace character after the `:` of a `gantt` task without data also
where the task follows a description on its line: `accDescr {style:#x} A;: `
lost it, and mermaid.js rejected the output.
