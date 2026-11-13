---
"prettier-plugin-mmd": patch
---

Keep one whitespace character after the `:` of a `sequenceDiagram` message or
note whose text is only whitespace: `A->>B:   ` is now printed `A ->> B: `
instead of `A ->> B:`. Before, the whitespace was dropped, because mermaid.js
12.3.0 reads both forms the same, but mermaid.js 10.9.8 rejects a `:` with
nothing after it, so a diagram that drew there stopped drawing once formatted.
Now one whitespace character stays, the first one as written.
