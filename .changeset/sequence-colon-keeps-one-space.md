---
"prettier-plugin-mmd": patch
---

Keep the first whitespace character after the `:` of a sequence message or note
whose text is only whitespace, and print the line as written where a directive
or a whitespace character other than a space and a tab follows the `:`:
`A->>B:   ` was printed `A ->> B:`, which mermaid.js before 11.7.0 rejects, and
is now printed `A ->> B: `.
