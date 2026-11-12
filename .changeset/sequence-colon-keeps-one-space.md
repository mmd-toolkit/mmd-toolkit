---
"prettier-plugin-mmd": patch
---

Keep one whitespace character after the `:` of a sequence message or note whose
text is only whitespace: `A->>B:   ` is now printed `A ->> B: ` instead of
`A ->> B:`. mermaid.js 10.9.8 rejects a `:` with nothing after it, so a diagram
that drew there stopped drawing once formatted.
