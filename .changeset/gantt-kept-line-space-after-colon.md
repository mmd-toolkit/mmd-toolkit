---
"prettier-plugin-mmd": patch
---

Keep one whitespace character after the `:` of a `gantt` task without data also
where the task follows a description on its line: `accDescr {style:#x} A;:` and
two spaces lost both, and mermaid.js rejected the output; one of them now stays.
